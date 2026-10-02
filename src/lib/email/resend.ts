import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_demo_key";
export const resend = new Resend(resendApiKey);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "İdari 360 <bildirim@idari360.com>";

export interface DailyDigestPayload {
  toEmail: string;
  recipientName: string;
  facilityName: string;
  date: string;
  openDemandsCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  pendingApprovalsCount: number;
  criticalAlerts: string[];
}

export async function sendDailyDigestEmail(payload: DailyDigestPayload) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_demo_key") {
    console.log("[Resend Mock] Daily Digest sent to:", payload.toEmail);
    return { success: true, mock: true, id: "mock-email-daily-001" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
          .stat-box { background: #f1f5f9; padding: 16px; border-radius: 12px; text-align: center; }
          .stat-val { font-size: 24px; font-weight: bold; color: #0f172a; }
          .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">İdari 360</div>
            <p style="color: #64748b; margin-top: 6px;">Günlük Operasyon Özeti — ${payload.date}</p>
          </div>
          <p>Sayın <strong>${payload.recipientName}</strong>,</p>
          <p><strong>${payload.facilityName}</strong> bünyesindeki idari işler ve operasyon durumu aşağıda özetlenmiştir:</p>
          
          <div class="stats-grid">
            <div class="stat-box" style="border-left: 4px solid #2563eb;">
              <div class="stat-val">${payload.openDemandsCount}</div>
              <div class="stat-label">Açık Talepler</div>
            </div>
            <div class="stat-box" style="border-left: 4px solid #f59e0b;">
              <div class="stat-val">${payload.inProgressCount}</div>
              <div class="stat-label">Devam Eden İşler</div>
            </div>
            <div class="stat-box" style="border-left: 4px solid #10b981;">
              <div class="stat-val">${payload.completedTodayCount}</div>
              <div class="stat-label">Tamamlanan İşler</div>
            </div>
            <div class="stat-box" style="border-left: 4px solid #8b5cf6;">
              <div class="stat-val">${payload.pendingApprovalsCount}</div>
              <div class="stat-label">Bekleyen Onaylar</div>
            </div>
          </div>

          ${
            payload.criticalAlerts.length > 0
              ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <strong style="color: #b91c1c;">⚠️ Kritik Uyarılar / Geciken Aksiyonlar:</strong>
                  <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #991b1b; font-size: 14px;">
                    ${payload.criticalAlerts.map((a) => `<li>${a}</li>`).join("")}
                  </ul>
                </div>`
              : ""
          }

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://idari360.com"}" 
               style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Yönetim Paneline Git
            </a>
          </div>

          <div class="footer">
            İdari 360 İdari İşler Yönetim Süreç Platformu • Otomatik Raporlama Sistemi
          </div>
        </div>
      </body>
    </html>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: payload.toEmail,
    subject: `İdari 360 — ${payload.facilityName} Günlük Operasyon Özeti (${payload.date})`,
    html,
  });
}

export interface AuditReminderPayload {
  toEmail: string;
  recipientName: string;
  auditTitle: string;
  facilityName: string;
  scheduledDate: string;
  daysRemaining: number;
}

export async function sendAuditReminderEmail(payload: AuditReminderPayload) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_demo_key") {
    console.log(`[Resend Mock] Audit reminder (${payload.daysRemaining} days left) sent to:`, payload.toEmail);
    return { success: true, mock: true, id: "mock-email-reminder-001" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background: #f8fafc; padding: 24px;">
        <div style="max-width: 560px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-top: 0;">🔔 Planlı Denetim Hatırlatması</h2>
          <p>Sayın <strong>${payload.recipientName}</strong>,</p>
          <p><strong>${payload.facilityName}</strong> için planlanan <strong>"${payload.auditTitle}"</strong> denetimine <strong>${payload.daysRemaining} gün</strong> kalmıştır.</p>
          <div style="background: #eff6ff; padding: 14px; border-radius: 8px; margin: 16px 0;">
            📅 <strong>Planlanan Tarih:</strong> ${payload.scheduledDate}
          </div>
          <p>Denetim hazırlıklarınızı ve gerekli kontrol listelerini sistem üzerinden inceleyebilirsiniz.</p>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">İdari 360 Bildirim ve Otomasyon Sistemi</p>
        </div>
      </body>
    </html>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: payload.toEmail,
    subject: `[Hatırlatma] ${payload.auditTitle} Denetimine ${payload.daysRemaining} Gün Kaldı`,
    html,
  });
}

// ─────────────────────────────────────────────────────
// Termin Yaklaşım Bildirimi
// ─────────────────────────────────────────────────────
export interface DeadlineNotificationPayload {
  toEmail: string;
  recipientName: string;
  operationNumber: string;
  operationTitle: string;
  facilityName: string;
  category: string;
  priority: string;
  status: string;
  deadline: string;
  daysRemaining: number;
}

const PRIORITY_TR: Record<string, string> = {
  dusuk: "Düşük", orta: "Orta", yuksek: "Yüksek", acil: "⚠️ ACİL",
};
const STATUS_TR: Record<string, string> = {
  yeni: "Yeni", devam_ediyor: "Devam Ediyor", beklemede: "Beklemede", onayda: "Onayda", tamamlandi: "Tamamlandı",
};

export async function sendDeadlineNotificationEmail(payload: DeadlineNotificationPayload) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_demo_key") {
    console.log(`[Resend Mock] Deadline notification (${payload.daysRemaining} days) sent to:`, payload.toEmail);
    return { success: true, mock: true, id: "mock-deadline-001" };
  }

  const urgencyColor = payload.daysRemaining <= 1 ? "#dc2626" : payload.daysRemaining <= 3 ? "#d97706" : "#2563eb";
  const urgencyBg = payload.daysRemaining <= 1 ? "#fef2f2" : payload.daysRemaining <= 3 ? "#fffbeb" : "#eff6ff";
  const urgencyLabel = payload.daysRemaining <= 1 ? "🚨 KRİTİK" : payload.daysRemaining <= 3 ? "⚠️ UYARI" : "ℹ️ BİLGİ";

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
            <div style="font-size: 22px; font-weight: 900; color: #1e293b;">İdari <span style="color: #2563eb;">360</span></div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Talep & Onay Termin Bildirimi</div>
          </div>

          <div style="background: ${urgencyBg}; border: 2px solid ${urgencyColor}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 14px; font-weight: 700; color: ${urgencyColor}; margin-bottom: 4px;">
              ${urgencyLabel} — Terminine ${payload.daysRemaining} Gün Kaldı
            </div>
            <div style="font-size: 12px; color: #475569;">
              Aşağıdaki talep ${payload.deadline} tarihinde sonuçlanması gerekiyor.
            </div>
          </div>

          <p style="font-size: 14px;">Sayın <strong>${payload.recipientName}</strong>,</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${payload.operationNumber}</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${payload.operationTitle}</div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 40%;">Tesis</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${payload.facilityName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Kategori</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${payload.category.charAt(0).toUpperCase() + payload.category.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Öncelik</td>
                <td style="padding: 6px 0; font-weight: 600; color: ${payload.priority === "acil" ? "#dc2626" : "#0f172a"};">${PRIORITY_TR[payload.priority] || payload.priority}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Mevcut Durum</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${STATUS_TR[payload.status] || payload.status}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Termin</td>
                <td style="padding: 6px 0; font-weight: 700; color: ${urgencyColor};">📅 ${payload.deadline}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://idari360.com"}/talepler"
               style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
              Talebi İncele & Güncelle
            </a>
          </div>

          <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            İdari 360 Otomatik Termin Bildirim Sistemi • Bu e-posta otomatik olarak gönderilmiştir.
          </div>
        </div>
      </body>
    </html>
  `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: payload.toEmail,
    subject: `[${payload.daysRemaining === 1 ? "🚨 BUGÜN" : `${payload.daysRemaining} GÜN`}] Termin: ${payload.operationNumber} — ${payload.operationTitle}`,
    html,
  });
}
