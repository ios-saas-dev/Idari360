-- ============================================================================
-- İDARİ 360 ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR SECURITY CONTEXT
-- ----------------------------------------------------------------------------

-- Function to get the current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to get the current user's facility_id
CREATE OR REPLACE FUNCTION current_user_facility()
RETURNS UUID AS $$
  SELECT facility_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 1. FACILITIES RLS
-- ----------------------------------------------------------------------------
-- Admin can view all facilities
-- Specialist and Supervisor can view only their own facility
-- Staff cannot view via web
CREATE POLICY "facilities_select_policy" ON facilities
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND id = current_user_facility())
  );

CREATE POLICY "facilities_modify_policy" ON facilities
  FOR ALL USING (
    current_user_role() = 'facility_admin'
  );

-- ----------------------------------------------------------------------------
-- 2. PROFILES RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR id = auth.uid()
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    current_user_role() = 'facility_admin'
    OR id = auth.uid()
  );

-- ----------------------------------------------------------------------------
-- 3. OPERATIONS / TALEPLER RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "operations_select_policy" ON operations
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "operations_insert_policy" ON operations
  FOR INSERT WITH CHECK (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "operations_update_policy" ON operations
  FOR UPDATE USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "operations_delete_policy" ON operations
  FOR DELETE USING (
    current_user_role() = 'facility_admin'
  );

-- ----------------------------------------------------------------------------
-- 4. REPORTS CONFIGURATION RLS (KRİTİK GEREKSİNİM)
-- Yönetici: Tüm raporlar
-- Uzman: Yalnızca kendi tesisi
-- Sorumlu & Personel: KESİNLİKLE ERİŞEMEZ!
-- ----------------------------------------------------------------------------
CREATE POLICY "reports_config_select_policy" ON reports_config
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() = 'facility_specialist' AND facility_id = current_user_facility())
  );

CREATE POLICY "reports_config_modify_policy" ON reports_config
  FOR ALL USING (
    current_user_role() = 'facility_admin'
  );

-- ----------------------------------------------------------------------------
-- 5. VEHICLES & TELEMETRY RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "vehicles_select_policy" ON vehicles
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "vehicles_modify_policy" ON vehicles
  FOR ALL USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "vehicle_telemetry_select_policy" ON vehicle_telemetry
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles v 
      WHERE v.id = vehicle_telemetry.vehicle_id 
      AND (
        current_user_role() = 'facility_admin'
        OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND v.facility_id = current_user_facility())
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 6. AUDIT TEMPLATES & QUESTIONS RLS (Read-only for standard users)
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_templates_select" ON audit_templates
  FOR SELECT USING (current_user_role() IN ('facility_admin', 'facility_specialist', 'facility_supervisor'));

CREATE POLICY "audit_questions_select" ON audit_questions
  FOR SELECT USING (current_user_role() IN ('facility_admin', 'facility_specialist', 'facility_supervisor'));

-- ----------------------------------------------------------------------------
-- 7. AUDIT SUBMISSIONS & ANSWERS RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_submissions_select" ON audit_submissions
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "audit_submissions_insert" ON audit_submissions
  FOR INSERT WITH CHECK (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "audit_answers_select" ON audit_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM audit_submissions s 
      WHERE s.id = audit_answers.submission_id 
      AND (
        current_user_role() = 'facility_admin'
        OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND s.facility_id = current_user_facility())
      )
    )
  );

CREATE POLICY "audit_answers_insert" ON audit_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM audit_submissions s 
      WHERE s.id = audit_answers.submission_id 
      AND (
        current_user_role() = 'facility_admin'
        OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND s.facility_id = current_user_facility())
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 8. ACTION ITEMS RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "action_items_select" ON action_items
  FOR SELECT USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

CREATE POLICY "action_items_modify" ON action_items
  FOR ALL USING (
    current_user_role() = 'facility_admin'
    OR (current_user_role() IN ('facility_specialist', 'facility_supervisor') AND facility_id = current_user_facility())
  );

-- ----------------------------------------------------------------------------
-- 9. SUPPLIERS RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "suppliers_select" ON suppliers
  FOR SELECT USING (current_user_role() IN ('facility_admin', 'facility_specialist', 'facility_supervisor'));

CREATE POLICY "suppliers_modify" ON suppliers
  FOR ALL USING (current_user_role() = 'facility_admin');

-- ----------------------------------------------------------------------------
-- 10. ANNOUNCEMENTS RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (
    facility_id IS NULL 
    OR current_user_role() = 'facility_admin'
    OR facility_id = current_user_facility()
  );

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS & FCM TOKENS RLS
-- ----------------------------------------------------------------------------
CREATE POLICY "notifications_user_policy" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "fcm_tokens_user_policy" ON fcm_tokens
  FOR ALL USING (user_id = auth.uid());
