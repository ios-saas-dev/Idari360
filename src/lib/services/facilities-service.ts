import { createClient } from "@/lib/supabase/client";
import { Facility } from "@/lib/supabase/types";

export interface CreateFacilityInput {
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  health_status?: "good" | "warning" | "critical";
  cleanliness_score?: number;
  pest_control_score?: number;
  waternet_score?: number;
  monthly_cost?: number;
}

export async function getFacilities(): Promise<Facility[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .order("code", { ascending: true });

  if (error || !data) {
    console.error("Facilities query error:", error?.message);
    return [];
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
    console.error("Facility query by id error:", error?.message);
    return null;
  }
  return data as Facility;
}

export async function createFacility(input: CreateFacilityInput): Promise<Facility> {
  const supabase = createClient();
  const newFacility = {
    ...input,
    health_status: input.health_status || "good",
    cleanliness_score: input.cleanliness_score ?? 90.0,
    pest_control_score: input.pest_control_score ?? 95.0,
    waternet_score: input.waternet_score ?? 88.0,
    monthly_cost: input.monthly_cost ?? 45000.0,
    satisfaction_score: 4.6,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("facilities")
    .insert([newFacility])
    .select()
    .single();

  if (error) {
    console.error("Facility create error:", error);
    throw error;
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
