import { createClient } from "@/lib/supabase/client";
import { Operation, OperationCategory, OperationPriority, OperationStatus } from "@/lib/supabase/types";
import { operationsList } from "@/lib/mock-data";

export interface CreateOperationInput {
  facility_id: string;
  title: string;
  category: OperationCategory;
  description?: string;
  priority: OperationPriority;
  deadline?: string;
}

export async function getOperations(): Promise<Operation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("operations")
    .select("*, facilities(name, code)")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return operationsList;
  }
  return data as Operation[];
}

export async function createOperation(input: CreateOperationInput): Promise<Operation> {
  const supabase = createClient();
  const operationNumber = `TAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOp = {
    ...input,
    operation_number: operationNumber,
    status: "yeni" as OperationStatus,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("operations")
    .insert([newOp])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error, falling back locally:", error);
    return {
      id: `op-${Date.now()}`,
      ...newOp,
    };
  }
  return data as Operation;
}

export async function updateOperationStatus(
  id: string,
  status: OperationStatus
): Promise<boolean> {
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
    console.error("Failed to update operation status in Supabase:", error);
    return false;
  }
  return true;
}
