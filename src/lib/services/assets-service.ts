import { createClient } from "@/lib/supabase/client";

export interface AssetRecord {
  id: string;
  facility_id: string;
  barcode: string;
  name: string;
  category: string;
  assigned_to?: string;
  status: "aktif" | "bakimda" | "arizali" | "hurda";
  purchase_date: string;
  facilities?: { name: string; code: string };
}

export interface CreateAssetInput {
  facility_id: string;
  name: string;
  category: string;
  assigned_to?: string;
  status?: "aktif" | "bakimda" | "arizali" | "hurda";
}

export async function getAssets(): Promise<AssetRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*, facilities(name, code)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("Assets query notice:", error?.message);
    return [];
  }
  return data as AssetRecord[];
}

export async function createAsset(input: CreateAssetInput): Promise<AssetRecord> {
  const supabase = createClient();
  const barcode = `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newAsset = {
    ...input,
    barcode,
    status: input.status || "aktif",
    purchase_date: new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase
    .from("assets")
    .insert([newAsset])
    .select("*, facilities(name, code)")
    .single();

  if (error) {
    console.error("Asset create error:", error);
    throw error;
  }
  return data as AssetRecord;
}
