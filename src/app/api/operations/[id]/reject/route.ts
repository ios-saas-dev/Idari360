import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json().catch(() => ({}));
    const reason: string = body?.reason || "";

    const { data: op, error: fetchErr } = await supabase
      .from("operations")
      .select("id, status, operation_number, title, description")
      .eq("id", params.id)
      .single();

    if (fetchErr || !op) {
      return NextResponse.json({ error: "Operasyon bulunamadı" }, { status: 404 });
    }

    const rejectionNote = reason ? `[REDDEDİLDİ: ${reason}]` : "[REDDEDİLDİ]";
    const updatedDescription = `${rejectionNote} ${op.description || ""}`.trim();

    const { error: updateErr } = await supabase
      .from("operations")
      .update({
        status: "devam_ediyor",
        description: updatedDescription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `${op.operation_number} reddedildi ve "Devam Ediyor" durumuna alındı.`,
      operationId: params.id,
      reason,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
