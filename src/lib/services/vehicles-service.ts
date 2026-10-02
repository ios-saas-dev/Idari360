import { createClient } from "@/lib/supabase/client";
import { Vehicle } from "@/lib/supabase/types";

export interface CreateVehicleInput {
  facility_id?: string;
  plate: string;
  vehicle_type: "servis" | "filo";
  brand: string;
  model: string;
  model_year: number;
  driver_name: string;
  driver_phone?: string;
  driver_src_valid?: boolean;
  driver_psychotechnic_valid?: boolean;
  capacity?: number;
  passenger_count?: number;
  route_name?: string;
  current_lat?: number;
  current_lng?: number;
  current_speed?: number;
  interior_temp?: number;
  ac_status?: boolean;
  cleanliness_score?: number;
  status?: "active" | "in_maintenance" | "idle";
  next_inspection_date?: string;
  last_maintenance_date?: string;
}

export async function getVehicles(type?: "servis" | "filo"): Promise<Vehicle[]> {
  const supabase = createClient();
  let query = supabase.from("vehicles").select("*").order("created_at", { ascending: false });

  if (type) {
    query = query.eq("vehicle_type", type);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching vehicles:", error);
    return [];
  }

  return data as Vehicle[];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching vehicle by id:", error);
    return null;
  }

  return data as Vehicle;
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const supabase = createClient();
  const newVehicle = {
    ...input,
    driver_src_valid: input.driver_src_valid ?? true,
    driver_psychotechnic_valid: input.driver_psychotechnic_valid ?? true,
    capacity: input.capacity ?? (input.vehicle_type === "servis" ? 16 : 5),
    passenger_count: input.passenger_count ?? 0,
    current_lat: input.current_lat ?? 41.0082,
    current_lng: input.current_lng ?? 28.9784,
    current_speed: input.current_speed ?? 0,
    interior_temp: input.interior_temp ?? 22.0,
    ac_status: input.ac_status ?? true,
    cleanliness_score: input.cleanliness_score ?? 95.0,
    status: input.status ?? "active",
  };

  const { data, error } = await supabase
    .from("vehicles")
    .insert([newVehicle])
    .select()
    .single();

  if (error) {
    console.error("Vehicle create error:", error);
    throw error;
  }

  return data as Vehicle;
}

export async function updateVehicleTelemetry(
  id: string,
  telemetry: {
    current_lat?: number;
    current_lng?: number;
    current_speed?: number;
    interior_temp?: number;
    ac_status?: boolean;
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicles")
    .update(telemetry)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating telemetry:", error);
    throw error;
  }

  // Also log to vehicle_telemetry table for historical trail if lat/lng are provided
  if (telemetry.current_lat !== undefined && telemetry.current_lng !== undefined) {
    await supabase.from("vehicle_telemetry").insert([
      {
        vehicle_id: id,
        lat: telemetry.current_lat,
        lng: telemetry.current_lng,
        speed: telemetry.current_speed ?? 0,
        interior_temp: telemetry.interior_temp,
        ac_status: telemetry.ac_status,
      },
    ]);
  }

  return data as Vehicle;
}
