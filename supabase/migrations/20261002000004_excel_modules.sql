-- ============================================================================
-- İDARİ 360 EXCEL MODULES: AKILLI ATIK & ATS TEMİZLİK ONAY SİSTEMİ
-- ============================================================================

-- 1. AKILLI ATIK YÖNETİMİ TABLOSU (Karton ve Naylon Tartım & Geri Dönüşüm Geliri)
CREATE TABLE IF NOT EXISTS waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cardboard_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  plastic_nylon_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_kg NUMERIC(10, 2) GENERATED ALWAYS AS (cardboard_kg + plastic_nylon_kg) STORED,
  cardboard_unit_price NUMERIC(8, 2) DEFAULT 2.40, -- TL/kg
  plastic_unit_price NUMERIC(8, 2) DEFAULT 3.80,   -- TL/kg
  total_revenue NUMERIC(12, 2) GENERATED ALWAYS AS (
    (cardboard_kg * 2.40) + (plastic_nylon_kg * 3.80)
  ) STORED,
  container_code VARCHAR(50),
  scale_operator VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATS TEMİZLİK FİRMA TARİH ÖNERİSİ & ŞUBE ONAY AKIŞI
CREATE TYPE ats_schedule_status AS ENUM (
  'firma_oneri_yapti',       -- Temizlik firması tarih önerir
  'sube_onayladi',           -- Şube "Onayla" seçti, plan kesinleşti
  'sube_yeni_tarih_istedi',  -- Şube "Yeni Tarih Öner" seçti
  'temizlik_tamamlandi',     -- Temizlik yapıldı, fotoğraf yüklendi
  'denetim_onaylandi'        -- Şube yöneticisi temizliği onayladı
);

CREATE TABLE IF NOT EXISTS ats_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  cleaning_type VARCHAR(100) NOT NULL, -- 'Zemin Derin Yıkama', 'Cam & Cephe', 'Genel Dezenfeksiyon'
  proposed_date DATE NOT NULL,
  counter_proposal_date DATE,
  confirmed_date DATE,
  status ats_schedule_status DEFAULT 'firma_oneri_yapti',
  completion_notes TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. YEMEKHANE TAŞIMA YEMEK ŞABLONU VE SORULARI
INSERT INTO audit_templates (id, title, category, total_max_score)
VALUES
  ('b0000000-0000-0000-0000-000000000004', 'Yemekhane Taşıma Yemek Hizmeti Denetimi', 'yemekhane_tasima', 100)
ON CONFLICT DO NOTHING;

-- RLS POLICIES FOR NEW TABLES
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waste_logs_all" ON waste_logs
  FOR ALL USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "ats_schedules_all" ON ats_schedules
  FOR ALL USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );
