import { createClient } from "@/lib/supabase/client";
import { Facility } from "@/lib/supabase/types";
import { facilitiesList } from "@/lib/mock-data";

export async function getFacilities(): Promise<Facility[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .order("code", { ascending: true });

  if (error || !data || data.length === 0) {
    return facilitiesList;
  }
  return data as Facility[];
}

export async function getFacilityById(id: string): Promise<Facility | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return facilitiesList.find((f) => f.id === id) || null;
  }
  return data as Facility;
}

export async function updateFacilityScores(
  id: string,
  scores: Partial<Facility>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("facilities")
    .update({ ...scores, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update facility:", error);
    throw error;
  }
  return data;
}
