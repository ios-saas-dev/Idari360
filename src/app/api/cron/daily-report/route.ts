import { NextResponse } from "next/server";
import { sendDailyDigestEmail } from "@/lib/email/resend";
import { facilitiesList, dashboardStats } from "@/lib/mock-data";

export async function GET(request: Request) {
  // Check authorization header for Vercel Cron security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "idari360_secure_cron_token_2026";

  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const results = [];

    // Yöneticiye genel özet
    const adminEmailResult = await sendDailyDigestEmail({
      toEmail: "yonetici@idari360.com",
      recipientName: "Mehmet Yılmaz (İdari İşler Yöneticisi)",
      facilityName: "Tüm Tesisler & Şubeler (Konsolide)",
      date: dashboardStats.dateDisplay,
      openDemandsCount: dashboardStats.openDemands.count,
      inProgressCount: dashboardStats.inProgress.count,
      completedTodayCount: dashboardStats.completed.count,
      pendingApprovalsCount: dashboardStats.pendingApprovals.count,
      criticalAlerts: [
        "Bornova Depo & Dağıtım hijyen skoru eşik değerin altında (%68)",
        "34 ABC 123 nolu servis aracının bakım tarihine 5 gün kaldı",
      ],
    });
    results.push({ role: "facility_admin", status: adminEmailResult });

    // Her bir tesisin Uzmanına yalnızca kendi tesis özeti
    for (const fac of facilitiesList.slice(0, 2)) {
      const specialistResult = await sendDailyDigestEmail({
        toEmail: `uzman.${fac.code.toLowerCase()}@idari360.com`,
        recipientName: `Tesis Uzmanı (${fac.name})`,
        facilityName: fac.name,
        date: dashboardStats.dateDisplay,
        openDemandsCount: 4,
        inProgressCount: 2,
        completedTodayCount: 15,
        pendingApprovalsCount: 1,
        criticalAlerts: fac.health_status === "warning" ? ["Açık hijyen aksiyonu mevcut"] : [],
      });
      results.push({ role: "facility_specialist", facility: fac.code, status: specialistResult });
    }

    return NextResponse.json({
      success: true,
      message: "Daily digest emails successfully processed",
      dispatchedCount: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch daily digest" },
      { status: 500 }
    );
  }
}
