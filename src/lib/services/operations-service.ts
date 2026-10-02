import { createClient } from "@/lib/supabase/client";
import { Operation, OperationCategory, OperationPriority, OperationStatus, UserRole } from "@/lib/supabase/types";

export interface CreateOperationInput {
  facility_id: string;
  title: string;
  category: OperationCategory;
  description?: string;
  priority: OperationPriority;
  deadline?: string;
  requester_id?: string;
}

export interface OperationFilters {
  facilityId?: string;
  category?: OperationCategory | "all";
  status?: OperationStatus | "all";
  search?: string;
}

// Rol bazlı izin verilen durum geçişleri
export const ALLOWED_TRANSITIONS: Record<UserRole, Record<OperationStatus, OperationStatus[]>> = {
  facility_admin: {
    yeni: ["devam_ediyor", "onayda", "tamamlandi", "beklemede"],
    devam_ediyor: ["beklemede", "onayda", "tamamlandi"],
    beklemede: ["devam_ediyor", "onayda", "tamamlandi"],
    onayda: ["tamamlandi", "devam_ediyor"],
    tamamlandi: [],
  },
  facility_specialist: {
    yeni: ["devam_ediyor", "beklemede"],
    devam_ediyor: ["beklemede", "tamamlandi"],
    beklemede: ["devam_ediyor"],
    onayda: [],
    tamamlandi: [],
  },
  facility_supervisor: {
    yeni: ["devam_ediyor"],
    devam_ediyor: ["beklemede"],
    beklemede: [],
    onayda: [],
    tamamlandi: [],
  },
  staff: {
    yeni: [],
    devam_ediyor: [],
    beklemede: [],
    onayda: [],
    tamamlandi: [],
  },
};

export async function getOperations(filters?: OperationFilters): Promise<Operation[]> {
  const supabase = createClient();

  let query = supabase
    .from("operations")
    .select("*, facilities(name, code)")
    .order("created_at", { ascending: false });

  if (filters?.facilityId && filters.facilityId !== "all") {
    query = query.eq("facility_id", filters.facilityId);
  }
  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,operation_number.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getOperations error:", error);
    return [];
  }
  return (data || []) as Operation[];
}

export async function getOperationById(id: string): Promise<Operation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("operations")
    .select("*, facilities(name, code, city)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Operation;
}

// Otomatik artan operation_number üretir
async function generateOperationNumber(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("operations")
    .select("*", { count: "exact", head: true });
  const seq = ((count || 0) + 1).toString().padStart(4, "0");
  return `TAL-${year}-${seq}`;
}

export async function createOperation(input: CreateOperationInput): Promise<Operation> {
  const supabase = createClient();
  const operationNumber = await generateOperationNumber();

  const newOp = {
    ...input,
    operation_number: operationNumber,
    status: "yeni" as OperationStatus,
    deadline: input.deadline ? new Date(input.deadline).toISOString() : null,
  };

  const { data, error } = await supabase
    .from("operations")
    .insert([newOp])
    .select("*, facilities(name, code)")
    .single();

  if (error) {
    console.error("createOperation error:", error);
    throw new Error(`Talep oluşturulamadı: ${error.message}`);
  }
  return data as Operation;
}

export async function updateOperationStatus(
  id: string,
  status: OperationStatus,
  userRole?: UserRole,
  currentStatus?: OperationStatus
): Promise<boolean> {
  // Rol bazlı geçiş kontrolü
  if (userRole && currentStatus) {
    const allowed = ALLOWED_TRANSITIONS[userRole]?.[currentStatus] || [];
    if (!allowed.includes(status)) {
      console.warn(`Role ${userRole} cannot transition from ${currentStatus} to ${status}`);
      return false;
    }
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("operations")
    .update({
      status,
      completed_at: status === "tamamlandi" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateOperationStatus error:", error);
    return false;
  }
  return true;
}

export async function approveOperation(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("operations")
    .update({
      status: "tamamlandi" as OperationStatus,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "onayda");

  if (error) {
    console.error("approveOperation error:", error);
    return false;
  }
  return true;
}

export async function rejectOperation(id: string, reason?: string): Promise<boolean> {
  const supabase = createClient();
  const description = reason
    ? `[REDDEDİLDİ: ${reason}]`
    : "[REDDEDİLDİ]";

  const { data: current } = await supabase
    .from("operations")
    .select("description")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("operations")
    .update({
      status: "devam_ediyor" as OperationStatus,
      description: `${description} ${current?.description || ""}`.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("rejectOperation error:", error);
    return false;
  }
  return true;
}

export async function assignOperation(id: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("operations")
    .update({
      assigned_to: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("assignOperation error:", error);
    return false;
  }
  return true;
}

// Termin yaklaşan (≤ 3 gün kalan) operasyonları getirir — cron job için
export async function getDeadlineApproachingOperations(days = 3): Promise<Operation[]> {
  const supabase = createClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("operations")
    .select("*, facilities(name, code, city)")
    .not("deadline", "is", null)
    .lte("deadline", cutoff)
    .gte("deadline", now.toISOString())
    .not("status", "in", '("tamamlandi")');

  if (error) {
    console.error("getDeadlineApproachingOperations error:", error);
    return [];
  }
  return (data || []) as Operation[];
}

// İstatistik özeti
export async function getOperationStats(facilityId?: string) {
  const supabase = createClient();
  let query = supabase.from("operations").select("status, priority");

  if (facilityId && facilityId !== "all") {
    query = query.eq("facility_id", facilityId);
  }

  const { data, error } = await query;
  if (error || !data) return { yeni: 0, devam_ediyor: 0, onayda: 0, tamamlandi: 0, beklemede: 0, acil: 0 };

  return {
    yeni: data.filter((d) => d.status === "yeni").length,
    devam_ediyor: data.filter((d) => d.status === "devam_ediyor").length,
    onayda: data.filter((d) => d.status === "onayda").length,
    beklemede: data.filter((d) => d.status === "beklemede").length,
    tamamlandi: data.filter((d) => d.status === "tamamlandi").length,
    acil: data.filter((d) => d.priority === "acil").length,
  };
}
