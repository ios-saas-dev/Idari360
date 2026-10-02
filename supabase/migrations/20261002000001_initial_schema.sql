-- ============================================================================
-- İDARİ 360 DATABASE SCHEMA (PostgreSQL + PostGIS Ready)
-- ============================================================================

-- PostGIS extension for spatial queries (vehicle tracking)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
  'facility_admin',       -- İdari İşler Yöneticisi (Tüm tesisler, tam yetki, tüm raporlar)
  'facility_specialist',    -- İdari İşler Uzmanı (Bağlı olduğu tesis, tesis raporları)
  'facility_supervisor',    -- İdari İşler Sorumlusu (Bağlı olduğu tesis, rapor yok)
  'staff'                   -- Personel (Sadece mobil, web'e KESİNLİKLE erişemez)
);

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

CREATE TYPE operation_priority AS ENUM (
  'dusuk',
  'orta',
  'yuksek',
  'acil'
);

CREATE TYPE operation_status AS ENUM (
  'yeni',
  'devam_ediyor',
  'beklemede',
  'onayda',
  'tamamlandi'
);

CREATE TYPE action_status AS ENUM (
  'acik',
  'devam_ediyor',
  'kapali'
);

-- 2. FACILITIES (ŞUBELER / TESİSLER)
CREATE TABLE IF NOT EXISTS facilities (
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

-- 3. PROFILES (KULLANICI PROFİLLERİ - auth.users ile ilişkili)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
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

-- 4. OPERATIONS / TALEPLER
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  operation_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category operation_category NOT NULL,
  description TEXT,
  priority operation_priority DEFAULT 'orta',
  status operation_status DEFAULT 'yeni',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  attachment_url TEXT,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REPORTS CONFIGURATION (OTOMATİK RAPORLAMA AYARLARI)
CREATE TABLE IF NOT EXISTS reports_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL, -- 'daily_digest', 'audit_summary', 'monthly_kpi'
  frequency VARCHAR(50) DEFAULT 'gunluk',
  recipient_roles user_role[] DEFAULT ARRAY['facility_admin', 'facility_specialist']::user_role[],
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VEHICLES (SERVİS & FİLO ARAÇLARI)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) DEFAULT 'servis', -- 'servis', 'filo'
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

-- 7. VEHICLE TELEMETRY (CANLI KONUM & SICAKLIK GEÇMİŞİ)
CREATE TABLE IF NOT EXISTS vehicle_telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  speed NUMERIC(5, 2) DEFAULT 0,
  interior_temp NUMERIC(4, 1),
  ac_status BOOLEAN,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT TEMPLATES (DENETİM ŞABLONLARI)
CREATE TABLE IF NOT EXISTS audit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'servis', 'yemekhane', 'temizlik', 'guvenlik'
  total_max_score INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT QUESTIONS (DENETİM SORULARI)
CREATE TABLE IF NOT EXISTS audit_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES audit_templates(id) ON DELETE CASCADE,
  category_section VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  points INT NOT NULL DEFAULT 2,
  sort_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT SUBMISSIONS (TAMAMLANAN VEYA DEVAM EDEN DENETİMLER)
CREATE TABLE IF NOT EXISTS audit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES audit_templates(id),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  auditor_id UUID NOT NULL REFERENCES profiles(id),
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_score INT DEFAULT 0,
  max_score INT DEFAULT 100,
  percentage_score NUMERIC(5, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'tamamlandi',
  general_notes TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT ANSWERS (SORU CEVAPLARI & UYGUNSUZLUK TESPİTİ)
CREATE TABLE IF NOT EXISTS audit_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES audit_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES audit_questions(id),
  is_compliant BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = Evet, FALSE = Hayır
  score_awarded INT NOT NULL DEFAULT 0,
  non_compliance_reason TEXT, -- 'Hayır' ise zorunlu açıklama
  deadline DATE,             -- 'Hayır' ise zorunlu termin tarihi
  photo_url TEXT,            -- Uygunsuzluk fotoğrafı
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ACTION ITEMS (UYGUNSUZLUK AKSİYON TAKİBİ)
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES audit_submissions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES audit_answers(id) ON DELETE CASCADE,
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

-- 13. SUPPLIERS (TEDARİKÇİ VE FİRMA KARNESİ)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Temizlik', 'Servis', 'Yemekhane', 'Güvenlik'
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

-- 14. ANNOUNCEMENTS (DUYURULAR)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS (BİLDİRİMLER)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FCM TOKENS (PUSH BİLDİRİMLERİ İÇİN CİHAZ KAYITLARI)
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type VARCHAR(50) DEFAULT 'web',
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
