import { createClient } from "@/lib/supabase/client";

export interface AtsScheduleRecord {
  id: string;
  facility_id: string;
  supplier_id?: string;
  cleaning_type: string;
  proposed_date: string;
  confirmed_date?: string;
  status:
    | "firma_oneri_yapti"
    | "sube_onayladi"
    | "sube_yeni_tarih_istedi"
    | "temizlik_tamamlandi"
    | "denetim_onaylandi";
  counter_proposal_date?: string;
  completion_notes?: string;
  facilities?: { name: string; code: string };
  suppliers?: { name: string };
}

export interface CreateAtsScheduleInput {
  facility_id: string;
  supplier_id?: string;
  cleaning_type: string;
  proposed_date: string;
}

export async function getAtsSchedules(facilityId?: string): Promise<AtsScheduleRecord[]> {
  const supabase = createClient();
  let query = supabase
    .from("ats_schedules")
    .select("*, facilities(name, code), suppliers(name)")
    .order("created_at", { ascending: false });

  if (facilityId) {
    query = query.eq("facility_id", facilityId);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.warn("ATS schedules query error:", error?.message);
    return [];
  }
  return data as AtsScheduleRecord[];
}

export async function createAtsProposal(input: CreateAtsScheduleInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ats_schedules")
    .insert([
      {
        ...input,
        status: "firma_oneri_yapti",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("ATS schedule insert error:", error);
    throw error;
  }
  return data;
}

export async function respondToAtsProposal(
  id: string,
  decision: "onayla" | "yeni_tarih",
  counterDate?: string
) {
  const supabase = createClient();
  const updates =
    decision === "onayla"
      ? { status: "sube_onayladi", confirmed_date: new Date().toISOString().slice(0, 10) }
      : { status: "sube_yeni_tarih_istedi", counter_proposal_date: counterDate };

  const { data, error } = await supabase
    .from("ats_schedules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to respond to ATS proposal:", error);
    throw error;
  }
  return data;
}
