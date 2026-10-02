-- ============================================================================
-- İDARİ 360 EKSİKSİZ VERİTABANI KURULUM BETİĞİ (COMPLETE DATABASE SETUP)
-- Supabase SQL Editor'de tek seferde çalıştırılabilir.
-- ============================================================================

-- 1. EKLENTİLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. ENUM TİPLERİ
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'facility_admin',
    'facility_specialist',
    'facility_supervisor',
    'staff'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE operation_category AS ENUM (
    'yemekhane',
    'servis',
    'filo',
    'temizlik',
    'varlik',
    'guvenlik',
    'teknik',
    'diger'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE operation_priority AS ENUM (
    'dusuk',
    'orta',
    'yuksek',
    'acil'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE operation_status AS ENUM (
    'yeni',
    'devam_ediyor',
    'beklemede',
    'onayda',
    'tamamlandi'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE action_status AS ENUM (
    'acik',
    'devam_ediyor',
    'kapali'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ats_schedule_status AS ENUM (
    'firma_oneri_yapti',
    'sube_onayladi',
    'sube_yeni_tarih_istedi',
    'temizlik_tamamlandi',
    'denetim_onaylandi'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. TABLOLAR
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  health_status VARCHAR(20) DEFAULT 'good' CHECK (health_status IN ('good', 'warning', 'critical')),
  satisfaction_score NUMERIC(3, 2) DEFAULT 4.60,
  cleanliness_score NUMERIC(5, 2) DEFAULT 90.0,
  pest_control_score NUMERIC(5, 2) DEFAULT 95.0,
  waternet_score NUMERIC(5, 2) DEFAULT 88.0,
  monthly_cost NUMERIC(12, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'facility_supervisor',
  phone VARCHAR(50),
  avatar_url TEXT,
  fcm_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  operation_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category operation_category NOT NULL,
  description TEXT,
  priority operation_priority DEFAULT 'orta',
  status operation_status DEFAULT 'yeni',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attachment_url TEXT,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'gunluk',
  recipient_roles user_role[] DEFAULT ARRAY['facility_admin', 'facility_specialist']::user_role[],
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) DEFAULT 'servis',
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  model_year INT NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  driver_phone VARCHAR(50),
  driver_src_valid BOOLEAN DEFAULT TRUE,
  driver_psychotechnic_valid BOOLEAN DEFAULT TRUE,
  capacity INT DEFAULT 16,
  passenger_count INT DEFAULT 12,
  route_name VARCHAR(255),
  current_lat DOUBLE PRECISION DEFAULT 41.0082,
  current_lng DOUBLE PRECISION DEFAULT 28.9784,
  current_speed NUMERIC(5, 2) DEFAULT 0,
  interior_temp NUMERIC(4, 1) DEFAULT 22.5,
  ac_status BOOLEAN DEFAULT TRUE,
  cleanliness_score NUMERIC(5, 2) DEFAULT 92.0,
  status VARCHAR(50) DEFAULT 'active',
  last_inspection_date DATE,
  next_inspection_date DATE,
  last_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed NUMERIC(5, 2) DEFAULT 0,
  interior_temp NUMERIC(4, 1),
  ac_status BOOLEAN,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_max_score INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.audit_templates(id) ON DELETE CASCADE,
  category_section VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  points INT NOT NULL DEFAULT 2,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.audit_templates(id),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  auditor_id UUID REFERENCES public.profiles(id),
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_score INT DEFAULT 0,
  max_score INT DEFAULT 100,
  percentage_score NUMERIC(5, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'tamamlandi',
  general_notes TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.audit_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.audit_questions(id),
  is_compliant BOOLEAN NOT NULL DEFAULT TRUE,
  score_awarded INT NOT NULL DEFAULT 0,
  non_compliance_reason TEXT,
  deadline DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.audit_submissions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.audit_answers(id) ON DELETE CASCADE,
  action_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  responsible_person VARCHAR(255) NOT NULL,
  opened_at DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status action_status DEFAULT 'acik',
  evidence_photo_url TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  service_quality_score NUMERIC(5, 2) DEFAULT 90.0,
  punctuality_score NUMERIC(5, 2) DEFAULT 85.0,
  complaint_score NUMERIC(5, 2) DEFAULT 82.0,
  staff_compliance_score NUMERIC(5, 2) DEFAULT 95.0,
  audit_score NUMERIC(5, 2) DEFAULT 86.0,
  action_closure_score NUMERIC(5, 2) DEFAULT 84.0,
  overall_score NUMERIC(5, 2) DEFAULT 87.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cardboard_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  plastic_nylon_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_kg NUMERIC(10, 2) GENERATED ALWAYS AS (cardboard_kg + plastic_nylon_kg) STORED,
  cardboard_unit_price NUMERIC(8, 2) DEFAULT 2.40,
  plastic_unit_price NUMERIC(8, 2) DEFAULT 3.80,
  total_revenue NUMERIC(12, 2) GENERATED ALWAYS AS ((cardboard_kg * 2.40) + (plastic_nylon_kg * 3.80)) STORED,
  container_code VARCHAR(50),
  scale_operator VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ats_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  cleaning_type VARCHAR(100) NOT NULL,
  proposed_date DATE NOT NULL,
  counter_proposal_date DATE,
  confirmed_date DATE,
  status ats_schedule_status DEFAULT 'firma_oneri_yapti',
  completion_notes TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GÜVENLİK YARDIMCI FONKSİYONLARI (RLS Context)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'facility_admin'::user_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_facility()
RETURNS UUID AS $$
  SELECT facility_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Okuma Politikaları
CREATE POLICY "facilities_select" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "facilities_all_admin" ON public.facilities FOR ALL USING (public.current_user_role() = 'facility_admin');

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.current_user_role() = 'facility_admin');

CREATE POLICY "operations_select" ON public.operations FOR SELECT USING (true);
CREATE POLICY "operations_insert" ON public.operations FOR INSERT WITH CHECK (true);
CREATE POLICY "operations_update" ON public.operations FOR UPDATE USING (true);

CREATE POLICY "reports_config_select" ON public.reports_config FOR SELECT USING (
  public.current_user_role() = 'facility_admin' 
  OR (public.current_user_role() = 'facility_specialist' AND facility_id = public.current_user_facility())
);

CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_modify" ON public.vehicles FOR ALL USING (public.current_user_role() IN ('facility_admin', 'facility_specialist', 'facility_supervisor'));

CREATE POLICY "audit_templates_select" ON public.audit_templates FOR SELECT USING (true);
CREATE POLICY "audit_questions_select" ON public.audit_questions FOR SELECT USING (true);
CREATE POLICY "audit_submissions_all" ON public.audit_submissions FOR ALL USING (true);
CREATE POLICY "audit_answers_all" ON public.audit_answers FOR ALL USING (true);
CREATE POLICY "action_items_all" ON public.action_items FOR ALL USING (true);
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "waste_logs_all" ON public.waste_logs FOR ALL USING (true);
CREATE POLICY "ats_schedules_all" ON public.ats_schedules FOR ALL USING (true);
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "notifications_all" ON public.notifications FOR ALL USING (true);

-- 6. BAŞLANGIÇ VERİLERİ (SEED DATA)
INSERT INTO public.facilities (id, code, name, city, address, phone, health_status, satisfaction_score, cleanliness_score, pest_control_score, waternet_score, monthly_cost)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'SUB-001', 'Agora Şubesi', 'İzmir', 'Mithatpaşa Cad. No:142 Balçova', '0232 277 00 00', 'good', 4.60, 92.5, 96.0, 90.0, 48500.00),
  ('a0000000-0000-0000-0000-000000000002', 'SUB-002', 'Maslak Genel Merkez', 'İstanbul', 'Büyükdere Cad. No:245 Maslak', '0212 335 00 00', 'good', 4.85, 96.0, 98.0, 94.0, 112000.00),
  ('a0000000-0000-0000-0000-000000000003', 'SUB-003', 'Kadıköy Lojistik Merkezi', 'İstanbul', 'E-5 Yan Yol No:12 Kozyatağı', '0216 410 00 00', 'warning', 3.90, 78.0, 85.0, 79.0, 64000.00),
  ('a0000000-0000-0000-0000-000000000004', 'SUB-004', 'Bornova Depo & Dağıtım', 'İzmir', 'Sanayi Cad. No:88 Bornova', '0232 461 00 00', 'critical', 3.40, 68.0, 72.0, 70.0, 52000.00),
  ('a0000000-0000-0000-0000-000000000005', 'SUB-005', 'Çankaya Tesisleri', 'Ankara', 'Turan Güneş Bulvarı No:60', '0312 440 00 00', 'good', 4.70, 94.0, 95.0, 92.0, 71500.00)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.audit_templates (id, title, category, total_max_score)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Servis Aracı Standart Denetim Formu', 'servis', 100),
  ('b0000000-0000-0000-0000-000000000002', 'Yemekhane Yerinde Üretim Hijyen & HACCP Denetimi', 'yemekhane', 100),
  ('b0000000-0000-0000-0000-000000000003', 'Tesis ve Saha Temizlik Denetim Formu', 'temizlik', 100),
  ('b0000000-0000-0000-0000-000000000004', 'Yemekhane Taşıma Yemek Hizmeti Denetimi', 'yemekhane_tasima', 100)
ON CONFLICT DO NOTHING;

-- Servis Soruları (Excel)
INSERT INTO public.audit_questions (template_id, category_section, question_text, points, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Temizlik', 'Aracın iç ve dış temizliği uygun mu?', 10, 1),
  ('b0000000-0000-0000-0000-000000000001', 'Temizlik', 'Araç içerisinde kötü koku, sigara kokusu veya hijyen sorunu var mı?', 10, 2),
  ('b0000000-0000-0000-0000-000000000001', 'Müşteri Alanı', 'Koltuklar sağlam, temiz ve yolcu kullanımına uygun mu?', 10, 3),
  ('b0000000-0000-0000-0000-000000000001', 'Müşteri Alanı', 'Klima sistemi çalışıyor ve yeterli performans gösteriyor mu?', 10, 4),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Emniyet kemerleri tüm koltuklarda çalışır durumda mı?', 4, 5),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Yangın söndürücü mevcut, dolum tarihi geçerli ve kolay ulaşılabilir mi?', 4, 6),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'İlk yardım çantası eksiksiz ve son kullanma tarihleri uygun mu?', 3, 7),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Acil çıkışlar, acil çıkış çekici ve güvenlik ekipmanları çalışır durumda mı?', 3, 8),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Lastiklerin diş derinliği ve genel durumu uygun mu?', 3, 9),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Farlar, sinyaller, stop lambaları ve geri vites lambaları çalışıyor mu?', 3, 10),
  ('b0000000-0000-0000-0000-000000000001', 'Evraklar', 'Sürücü üzerinde kimlik kartı ve gerekli sürücü belgeleri (SRC, Psikoteknik vb.) güncel ve yanında mı?', 20, 11),
  ('b0000000-0000-0000-0000-000000000001', 'Personel', 'Sürücü personellere karşı saygılı ve profesyonel bir iletişim sergiliyor mu?', 20, 12)
ON CONFLICT DO NOTHING;

-- Araçlar
INSERT INTO public.vehicles (plate, vehicle_type, brand, model, model_year, driver_name, driver_phone, capacity, passenger_count, route_name, current_lat, current_lng, current_speed, interior_temp, ac_status, cleanliness_score)
VALUES
  ('34 ABC 123', 'servis', 'Mercedes-Benz', 'Sprinter 16+1', 2024, 'Ali Öztürk', '0532 999 11 22', 16, 14, 'Kadıköy - Maslak Ekspres', 41.0125, 28.9800, 48.5, 22.4, TRUE, 94.0),
  ('34 XYZ 789', 'servis', 'Volkswagen', 'Crafter 19+1', 2023, 'Kemal Aydın', '0533 777 44 11', 19, 18, 'Beylikdüzü - Maslak Ring', 40.9980, 28.9100, 52.0, 23.1, TRUE, 91.0),
  ('35 IZM 360', 'servis', 'Ford', 'Transit 16+1', 2025, 'Hüseyin Kaya', '0544 555 22 33', 16, 15, 'Bornova - Agora Ring', 38.4192, 27.1287, 42.0, 21.8, TRUE, 96.0),
  ('06 ANK 360', 'filo', 'Renault', 'Megane Sedan', 2024, 'İdari Hizmet Aracı', '0312 440 00 00', 5, 2, 'Çankaya Saha Kontrol', 39.9208, 32.8541, 35.0, 22.0, TRUE, 98.0)
ON CONFLICT (plate) DO NOTHING;

-- Tedarikçiler
INSERT INTO public.suppliers (name, category, contact_person, phone, email, service_quality_score, punctuality_score, complaint_score, staff_compliance_score, audit_score, action_closure_score, overall_score)
VALUES
  ('ABC Temizlik ve Tesis Hizmetleri', 'Temizlik', 'Ahmet Demir', '0532 111 22 33', 'operasyon@abctemizlik.com', 90.0, 85.0, 82.0, 95.0, 86.0, 84.0, 87.0),
  ('Lider Turizm Servis Taşımacılık', 'Servis', 'Mustafa Kara', '0542 333 44 55', 'filo@liderturizm.com', 92.0, 94.0, 88.0, 96.0, 91.0, 90.0, 91.8),
  ('Gourmet Catering & Yemek San.', 'Yemekhane', 'Ayşe Güler', '0555 666 77 88', 'kalite@gourmetcatering.com', 88.0, 90.0, 85.0, 92.0, 89.0, 86.0, 88.3),
  ('Kale Güvenlik ve Koruma Hiz.', 'Güvenlik', 'Selim Yıldız', '0533 888 99 00', 'guvenlik@kaleguvenlik.com', 95.0, 96.0, 92.0, 98.0, 94.0, 95.0, 95.0)
ON CONFLICT DO NOTHING;

-- Duyurular (Referans Görseldeki)
INSERT INTO public.announcements (title, content, date)
VALUES
  ('Bayram Tatili Duyurusu', 'Kurban Bayramı tatili 6-9 Haziran tarihleri arasındadır. Nöbetçi idari kadro bilgilendirilmiştir.', '2026-05-30'),
  ('Yemekhane Çalışma Saatleri', '1 Haziran itibarıyla yemekhane saatlerinde değişiklik olacaktır. Öğle servisi 12:00-14:00 saatleri arasına çekilmiştir.', '2026-05-28'),
  ('Servis Güzergah Güncellemesi', 'Bazı servis güzergahlarında güncelleme yapılmıştır. Yeni güzergah detayları Servis modülüne yüklenmiştir.', '2026-05-27')
ON CONFLICT DO NOTHING;
