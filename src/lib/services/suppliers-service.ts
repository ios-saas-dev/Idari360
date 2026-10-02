import { createClient } from "@/lib/supabase/client";
import { Supplier } from "@/lib/supabase/types";

export async function getSuppliers(category?: string): Promise<Supplier[]> {
  const supabase = createClient();
  let query = supabase.from("suppliers").select("*").order("overall_score", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching suppliers:", error);
    return [];
  }

  return data as Supplier[];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching supplier by id:", error);
    return null;
  }

  return data as Supplier;
}

export async function updateSupplierScores(
  id: string,
  scores: Partial<Supplier>
): Promise<Supplier> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .update(scores)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating supplier scores:", error);
    throw error;
  }

  return data as Supplier;
}
