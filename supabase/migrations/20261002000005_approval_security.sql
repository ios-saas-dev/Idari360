-- ============================================================================
-- FAZ GÜVENLIK: E-posta Doğrulama + Yönetici Onayı Sistemi
-- Migration: 20261002000005_approval_security.sql
-- ============================================================================

-- 1. profiles tablosuna onay alanları ekle
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS requested_role user_role DEFAULT 'facility_supervisor';

-- Mevcut (zaten aktif) kullanıcıları onaylı say
UPDATE profiles SET approval_status = 'approved' WHERE is_active = TRUE;

-- ─────────────────────────────────────────────────────────────────
-- 2. Yeni kullanıcı kaydında otomatik 'pending' profil oluşturan TRIGGER
--    auth.users tablosuna INSERT olduğunda tetiklenir.
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    requested_role,
    approval_status,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'facility_supervisor',        -- Güvenli default: en düşük yetki
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'facility_supervisor'
    ),
    'pending',                    -- Yönetici onayı bekliyor
    FALSE                         -- Onaylanana kadar aktif DEĞİL
  )
  ON CONFLICT (id) DO NOTHING;   -- Çift kayıt önlemi

  RETURN NEW;
END;
$$;

-- Eski trigger varsa sil, yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- ─────────────────────────────────────────────────────────────────
-- 3. RLS POLİCY GÜNCELLEMELERİ - Onaysız kullanıcı veri OKUYAMAZ
-- ─────────────────────────────────────────────────────────────────

-- Helper function: Geçerli kullanıcı onaylı ve aktif mi?
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND approval_status = 'approved'
      AND is_active = TRUE
  );
$$;

-- Helper function: Geçerli kullanıcı facility_admin mi?
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'facility_admin'
      AND approval_status = 'approved'
      AND is_active = TRUE
  );
$$;

-- ─── operations tablosu: Sadece onaylılar okuyabilir ───
DROP POLICY IF EXISTS "operations_select_policy" ON operations;
CREATE POLICY "operations_approved_select"
  ON operations FOR SELECT
  TO authenticated
  USING (public.is_approved_user());

DROP POLICY IF EXISTS "operations_insert_policy" ON operations;
CREATE POLICY "operations_approved_insert"
  ON operations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved_user());

DROP POLICY IF EXISTS "operations_update_policy" ON operations;
CREATE POLICY "operations_approved_update"
  ON operations FOR UPDATE
  TO authenticated
  USING (public.is_approved_user());

-- ─── facilities tablosu ───
DROP POLICY IF EXISTS "facilities_select_policy" ON facilities;
CREATE POLICY "facilities_approved_select"
  ON facilities FOR SELECT
  TO authenticated
  USING (public.is_approved_user());

-- ─── suppliers tablosu ───
DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
CREATE POLICY "suppliers_approved_select"
  ON suppliers FOR SELECT
  TO authenticated
  USING (public.is_approved_user());

-- ─── announcements tablosu ───
DROP POLICY IF EXISTS "announcements_select_policy" ON announcements;
CREATE POLICY "announcements_approved_select"
  ON announcements FOR SELECT
  TO authenticated
  USING (public.is_approved_user());

-- ─── profiles tablosu: Herkes kendi profilini okuyabilir, Yönetici hepsini ───
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()           -- Kullanıcı kendi profilini okur (onay ekranı için)
    OR public.is_admin_user() -- Yönetici hepsini okur (onay paneli için)
  );

-- Yönetici onay/ret işlemi yapabilir
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Yeni profil oluşturma yalnızca trigger ile (service_role)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────
-- 4. Onay işlemi için stored procedure (güvenli server-side işlem)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.approve_user(
  target_user_id UUID,
  assigned_role user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Sadece admin yapabilir
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized: Only facility_admin can approve users.';
  END IF;

  UPDATE public.profiles
  SET
    role = assigned_role,
    approval_status = 'approved',
    is_active = TRUE,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', target_user_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'user_id', target_user_id, 'role', assigned_role);
END;
$$;

-- Ret işlemi için stored procedure
CREATE OR REPLACE FUNCTION public.reject_user(
  target_user_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized: Only facility_admin can reject users.';
  END IF;

  UPDATE public.profiles
  SET
    approval_status = 'rejected',
    is_active = FALSE,
    rejection_reason = reason,
    approved_by = auth.uid(),
    approved_at = NOW()
  WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', target_user_id);
END;
$$;
