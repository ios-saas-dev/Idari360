import { createClient } from "@/lib/supabase/client";

export interface WasteLogEntry {
  facility_id: string;
  cardboard_kg: number;
  plastic_nylon_kg: number;
  container_code?: string;
  scale_operator?: string;
  notes?: string;
}

export async function createWasteLog(entry: WasteLogEntry) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("waste_logs")
    .insert([
      {
        ...entry,
        log_date: new Date().toISOString().slice(0, 10),
      },
    ])
    .select()
    .single();

  if (error) {
    console.warn("Waste log insert notice:", error.message);
  }
  return data;
}

export async function getWasteLogs(facilityId?: string) {
  const supabase = createClient();
  let query = supabase.from("waste_logs").select("*, facilities(name)");
  if (facilityId) {
    query = query.eq("facility_id", facilityId);
  }
  const { data, error } = await query.order("log_date", { ascending: false });
  return data || [];
}
