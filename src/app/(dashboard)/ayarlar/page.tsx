"use client";

import { useState } from "react";
import { Settings, Shield, Bell, Mail, Smartphone, Check, Send } from "lucide-react";
import { UserRole } from "@/lib/supabase/types";

export default function AyarlarPage() {
  const [cronTriggerStatus, setCronTriggerStatus] = useState<string | null>(null);

  const handleTestCronDailyDigest = async () => {
    setCronTriggerStatus("Günlük özet cron tetikleniyor...");
    try {
      const res = await fetch("/api/cron/daily-report");
      const data = await res.json();
      setCronTriggerStatus("✅ Günlük özet raporu başarıyla oluşturuldu ve Resend ile iletildi!");
    } catch {
      setCronTriggerStatus("❌ Cron tetikleme hatası");
    }
  };

  const handleTestAuditReminders = async () => {
    setCronTriggerStatus("Denetim hatırlatma cron tetikleniyor...");
    try {
      const res = await fetch("/api/cron/audit-reminders");
      const data = await res.json();
      setCronTriggerStatus("✅ 7 gün, 3 gün, 1 gün kalan denetim hatırlatmaları iletildi!");
    } catch {
      setCronTriggerStatus("❌ Hatırlatma tetikleme hatası");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Sistem & Yetki Ayarları
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Supabase RLS güvenlik matrisi, Resend e-posta raporlama otomasyonu ve FCM bildirimleri.
        </p>
      </div>

      {/* Security Role Matrix Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Rol ve Yetki Mimarisi (Kritik Güvenlik Gereksinimleri)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <span className="font-bold text-blue-900 block mb-1">1. İdari İşler Yöneticisi</span>
            <p className="text-slate-600 leading-relaxed">
              Tüm tesislere ait verilere limitsiz okuma/yazma erişimi, tam konsolide dashboard ve tüm tesisleri kapsayan otomatik rapor alma yetkisine sahiptir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">2. İdari İşler Uzmanı</span>
            <p className="text-slate-600 leading-relaxed">
              Yalnızca veritabanında (users.facility_id) bağlı bulunduğu tesisin verilerine erişim, işlem yapma ve yalnızca o tesisin otomatik raporlarını alma yetkisine sahiptir.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <span className="font-bold text-amber-900 block mb-1">3. İdari İşler Sorumlusu</span>
            <p className="text-slate-600 leading-relaxed">
              Yalnızca kendi tesisinin verilerine erişim ve işlem yapma yetkisi. Bu role hiçbir sistem raporu gönderilmez.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
            <span className="font-bold text-red-900 block mb-1">4. Personel (Mobil)</span>
            <p className="text-slate-600 leading-relaxed">
              Projenin web platformuna KESİNLİKLE erişemez. Web&apos;den giriş yaptığında Next.js Middleware tarafından anında /yetkisiz-erisim sayfasına yönlendirilir ve oturumu kapatılır.
            </p>
          </div>
        </div>
      </div>

      {/* Vercel Cron & Resend Automation Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Mail className="w-5 h-5 text-purple-600" />
          <span>Vercel Cron & Resend Otomatik Raporlama Testi</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Sistemde tanımlı iki otomatik Cron bulunmaktadır:
          <br />• <strong>05:00 UTC (08:00 TSİ):</strong> Günlük konsolide operasyon özeti (Yönetici & Uzmanlara)
          <br />• <strong>06:00 UTC (09:00 TSİ):</strong> 7 gün, 3 gün, 1 gün kalan denetimlerin ve geciken aksiyonların bildirilmesi.
        </p>

        {cronTriggerStatus && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200">
            {cronTriggerStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleTestCronDailyDigest}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Günlük Özet Cron&apos;unu Manuel Tetikle
          </button>

          <button
            onClick={handleTestAuditReminders}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            Denetim Hatırlatıcı Cron&apos;unu Manuel Tetikle
          </button>
        </div>
      </div>
    </div>
  );
}
