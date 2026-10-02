import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDeadlineNotificationEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "idari360_secure_cron_token_2026";

  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Terminé yaklaşan aktif operasyonlar (3 gün içinde, tamamlanmamış)
    const { data: operations, error } = await supabase
      .from("operations")
      .select("*, facilities(name, code, city)")
      .not("deadline", "is", null)
      .lte("deadline", in3Days)
      .gte("deadline", now.toISOString())
      .not("status", "in", '("tamamlandi")')
      .order("deadline", { ascending: true });

    if (error) throw error;

    if (!operations || operations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Termin yaklaşan operasyon bulunamadı.",
        processed: 0,
        timestamp: now.toISOString(),
      });
    }

    // Yöneticilerin e-posta adreslerini al (facility_admin ve facility_specialist)
    const { data: admins } = await supabase
      .from("profiles")
      .select("email, full_name, facility_id, role")
      .in("role", ["facility_admin", "facility_specialist"])
      .eq("is_active", true);

    const results = [];

    for (const op of operations) {
      const facility = (op.facilities as any);
      const deadline = new Date(op.deadline!);
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Bu tesis için sorumlu olan yöneticileri bul
      const recipients = (admins || []).filter(
        (a) => a.role === "facility_admin" || a.facility_id === op.facility_id
      );

      for (const recipient of recipients) {
        try {
          const emailRes = await sendDeadlineNotificationEmail({
            toEmail: recipient.email,
            recipientName: recipient.full_name,
            operationNumber: op.operation_number,
            operationTitle: op.title,
            facilityName: facility?.name || "Bilinmeyen Tesis",
            category: op.category,
            priority: op.priority,
            status: op.status,
            deadline: deadline.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }),
            daysRemaining,
          });
          results.push({
            operation: op.operation_number,
            recipient: recipient.email,
            daysRemaining,
            status: "sent",
            emailId: (emailRes as any)?.id,
          });
        } catch (emailError: any) {
          results.push({
            operation: op.operation_number,
            recipient: recipient.email,
            daysRemaining,
            status: "error",
            error: emailError.message,
          });
        }
      }

      // Supabase notifications tablosuna da kaydet
      for (const recipient of recipients) {
        await supabase.from("notifications").insert({
          user_id: recipient.email, // profiles tablosu id ile birleştirilebilir
          title: `⏰ Termin Yaklaşıyor: ${op.operation_number}`,
          message: `"${op.title}" talebinin terminine ${daysRemaining} gün kaldı.`,
          type: "deadline_warning",
          related_operation_id: op.id,
          is_read: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      operationsChecked: operations.length,
      notificationsSent: results.filter((r) => r.status === "sent").length,
      errors: results.filter((r) => r.status === "error").length,
      details: results,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    console.error("Deadline notification cron error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}
