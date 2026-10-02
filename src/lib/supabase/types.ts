export type UserRole =
  | 'facility_admin'       // İdari İşler Yöneticisi: Limitsiz yetki, tüm tesisler, tüm raporlar
  | 'facility_specialist'    // İdari İşler Uzmanı: Yalnızca bağlı olduğu tesis, tesis raporları
  | 'facility_supervisor'    // İdari İşler Sorumlusu: Yalnızca kendi tesisi, rapor YOK
  | 'staff';                 // Personel: Web'e KESİNLİKLE giremez!

export type OperationCategory =
  | 'yemekhane'
  | 'servis'
  | 'filo'
  | 'temizlik'
  | 'varlik'
  | 'guvenlik'
  | 'teknik'
  | 'diger';

export type OperationPriority = 'dusuk' | 'orta' | 'yuksek' | 'acil';
export type OperationStatus = 'yeni' | 'devam_ediyor' | 'beklemede' | 'onayda' | 'tamamlandi';
export type ActionStatus = 'acik' | 'devam_ediyor' | 'kapali';

export interface Facility {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  health_status: 'good' | 'warning' | 'critical';
  satisfaction_score: number;
  cleanliness_score: number;
  pest_control_score: number;
  waternet_score: number;
  monthly_cost: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  facility_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  fcm_token?: string;
  is_active: boolean;
  facility?: Facility;
}

export interface Operation {
  id: string;
  facility_id: string;
  operation_number: string;
  title: string;
  category: OperationCategory;
  description?: string;
  priority: OperationPriority;
  status: OperationStatus;
  assigned_to?: string;
  requester_id?: string;
  attachment_url?: string;
  deadline?: string;
  completed_at?: string;
  created_at: string;
  facility?: Facility;
}

export interface Vehicle {
  id: string;
  facility_id?: string;
  plate: string;
  vehicle_type: 'servis' | 'filo';
  brand: string;
  model: string;
  model_year: number;
  driver_name: string;
  driver_phone?: string;
  driver_src_valid: boolean;
  driver_psychotechnic_valid: boolean;
  capacity: number;
  passenger_count: number;
  route_name?: string;
  current_lat: number;
  current_lng: number;
  current_speed: number;
  interior_temp: number;
  ac_status: boolean;
  cleanliness_score: number;
  status: 'active' | 'in_maintenance' | 'idle';
  last_maintenance_date?: string;
  next_inspection_date?: string;
}

export interface AuditQuestion {
  id: string;
  template_id: string;
  category_section: string;
  question_text: string;
  points: number;
  sort_order: number;
}

export interface AuditAnswerInput {
  question_id: string;
  is_compliant: boolean; // true = Evet, false = Hayır
  non_compliance_reason?: string;
  deadline?: string;
  photo_url?: string;
}

export interface ActionItem {
  id: string;
  action_number: string;
  facility_id: string;
  submission_id?: string;
  title: string;
  description: string;
  responsible_person: string;
  opened_at: string;
  due_date: string;
  status: ActionStatus;
  evidence_photo_url?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: 'Temizlik' | 'Servis' | 'Yemekhane' | 'Güvenlik';
  contact_person?: string;
  phone?: string;
  email?: string;
  service_quality_score: number;
  punctuality_score: number;
  complaint_score: number;
  staff_compliance_score: number;
  audit_score: number;
  action_closure_score: number;
  overall_score: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  facility_id?: string;
}
