import { createClient } from "@/lib/supabase/client";

export interface CreateAtsScheduleInput {
  facility_id: string;
  supplier_id?: string;
  cleaning_type: string;
  proposed_date: string;
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
    console.warn("ATS schedule insert notice:", error.message);
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
