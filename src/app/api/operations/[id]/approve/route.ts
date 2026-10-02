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
    const { data: op, error: fetchErr } = await supabase
      .from("operations")
      .select("id, status, operation_number, title")
      .eq("id", params.id)
      .single();

    if (fetchErr || !op) {
      return NextResponse.json({ error: "Operasyon bulunamadı" }, { status: 404 });
    }

    if (op.status !== "onayda") {
      return NextResponse.json(
        { error: `Bu operasyon onay beklemediği için onaylanamaz (mevcut durum: ${op.status})` },
        { status: 400 }
      );
    }

    const { error: updateErr } = await supabase
      .from("operations")
      .update({
        status: "tamamlandi",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `${op.operation_number} başarıyla onaylandı ve tamamlandı.`,
      operationId: params.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
