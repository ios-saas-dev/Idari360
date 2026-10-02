import { NextResponse } from "next/server";
import { sendAuditReminderEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "idari360_secure_cron_token_2026";

  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const scheduledReminders = [
      {
        toEmail: "idari.isler.agora@idari360.com",
        recipientName: "Agora İdari İşler Ekibi",
        auditTitle: "Aylık Tesis ve Hijyen Denetimi",
        facilityName: "Agora Şubesi",
        scheduledDate: "15 Haziran 2026",
        daysRemaining: 7,
      },
      {
        toEmail: "servis.kadikoy@idari360.com",
        recipientName: "Kadıköy Servis Sorumlusu",
        auditTitle: "Servis Filosu Güvenlik ve Donanım Denetimi",
        facilityName: "Kadıköy Lojistik Merkezi",
        scheduledDate: "5 Haziran 2026",
        daysRemaining: 3,
      },
      {
        toEmail: "yemekhane.maslak@idari360.com",
        recipientName: "Maslak Yemekhane Kalite Sorumlusu",
        auditTitle: "HACCP & Gıda Güvenliği Denetimi",
        facilityName: "Maslak Genel Merkez",
        scheduledDate: "31 Mayıs 2026",
        daysRemaining: 1,
      },
    ];

    const results = [];
    for (const item of scheduledReminders) {
      const emailRes = await sendAuditReminderEmail(item);
      results.push({ email: item.toEmail, days: item.daysRemaining, status: emailRes });
    }

    return NextResponse.json({
      success: true,
      remindersProcessed: results.length,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process audit reminders" },
      { status: 500 }
    );
  }
}
