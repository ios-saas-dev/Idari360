-- ================================================================
-- İDARİ 360 - TAM GÜVENLİK DÜZELTME SCRIPTI
-- Supabase Security Advisor Tüm Uyarıları Kapatır
-- ================================================================

-- ================================================================
-- DÜZELTME 1: ANONİM KULLANICILARIN FONKSİYON ÇAĞIRMASINI ENGELLE
-- (anon_security_definer_function_executable)
-- ================================================================
REVOKE EXECUTE ON FUNCTION public.approve_user(uuid, public.user_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reject_user(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_facility() FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_registration() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_approved_user() FROM anon;

-- PostGIS sistem fonksiyonlarından da anon erişimini kaldır
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM anon;

-- Trigger fonksiyonu REST API'den çağrılmamalı (sadece trigger çağırır)
REVOKE EXECUTE ON FUNCTION public.handle_new_user_registration() FROM authenticated;

-- ================================================================
-- DÜZELTME 2: "HER ZAMAN TRUE" OLAN GEVŞEK RLS POLİTİKALARI DÜZELTİLİYOR
-- (rls_policy_always_true) - Onaylı kullanıcı koşulu ekleniyor
-- ================================================================

-- action_items
DROP POLICY IF EXISTS "action_items_all" ON action_items;
CREATE POLICY "action_items_all" ON action_items
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- assets
DROP POLICY IF EXISTS "assets_modify" ON assets;
CREATE POLICY "assets_modify" ON assets
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- ats_schedules
DROP POLICY IF EXISTS "ats_schedules_all" ON ats_schedules;
CREATE POLICY "ats_schedules_all" ON ats_schedules
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- audit_answers
DROP POLICY IF EXISTS "audit_answers_all" ON audit_answers;
CREATE POLICY "audit_answers_all" ON audit_answers
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- audit_submissions
DROP POLICY IF EXISTS "audit_submissions_all" ON audit_submissions;
CREATE POLICY "audit_submissions_all" ON audit_submissions
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- notifications: Sadece kendi bildirimlerine erişebilir
DROP POLICY IF EXISTS "notifications_all" ON notifications;
CREATE POLICY "notifications_all" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- operations insert: Onaylı kullanıcı koşulu ekle
DROP POLICY IF EXISTS "operations_insert" ON operations;
CREATE POLICY "operations_insert" ON operations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_user());

-- operations update: Onaylı kullanıcı koşulu ekle
DROP POLICY IF EXISTS "operations_update" ON operations;
CREATE POLICY "operations_update" ON operations
  FOR UPDATE TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- waste_logs
DROP POLICY IF EXISTS "waste_logs_all" ON waste_logs;
CREATE POLICY "waste_logs_all" ON waste_logs
  FOR ALL TO authenticated
  USING (public.is_approved_user())
  WITH CHECK (public.is_approved_user());

-- ================================================================
-- DÜZELTME 3: FONKSIYONLARA SET search_path EKLENİYOR
-- (function_search_path_mutable)
-- ================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_facility()
RETURNS UUID AS $$
  SELECT facility_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND approval_status = 'approved' 
    AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'facility_admin' 
    AND approval_status = 'approved' 
    AND is_active = TRUE
  );
$$;

-- ================================================================
-- DÜZELTME 4: approve_user ve reject_user SADECE YÖNETİCİ TARAFINDAN
-- ÇAĞRILACAK ŞEKİLDE GRANT YAPISINI DÜZELT
-- ================================================================

-- Mevcut izinleri sıfırla ve sadece authenticated'a ver (fonksiyon içinde admin kontrolü var)
REVOKE EXECUTE ON FUNCTION public.approve_user(uuid, public.user_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reject_user(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_user(uuid, public.user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_user(uuid, text) TO authenticated;

-- ================================================================
-- NOT: spatial_ref_sys ve postgis PostGIS sistem tabloları/eklentileri
-- olduğundan bunlar değiştirilemez (Supabase'in kendisi oluşturmuştur).
-- Bu uyarılar false-positive'dir ve uygulamanın güvenliğini etkilemez.
-- ================================================================

SELECT 'Tüm güvenlik düzeltmeleri başarıyla uygulandı!' AS sonuc;
