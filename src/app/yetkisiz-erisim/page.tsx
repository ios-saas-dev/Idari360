"use client";

import Link from "next/link";
import { ShieldAlert, Smartphone, ArrowLeft, RefreshCw } from "lucide-react";

export default function UnauthorizedPage() {
  const handleSwitchToAdmin = () => {
    // Demo amacıyla admin çerezini ayarlayıp panele dönmeyi sağlar
    document.cookie = "idari360_user_role=facility_admin; path=/; max-age=86400";
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full mb-3">
          Web Paneline Erişim Kısıtlı
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Yetkisiz Erişim / Personel Hesabı
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          İdari 360 Web Yönetim Paneli yalnızca <strong>İdari İşler Yöneticisi, Uzmanı ve Sorumlusu</strong> yetkilerine sahip personele açıktır.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-left mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">Mobil Uygulama Bilgilendirmesi</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Saha ve operasyon personeli için servis, yemekhane ve talep bildirimleri yakında yayınlanacak <strong>İdari 360 Mobil</strong> uygulaması üzerinden sağlanacaktır.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Farklı Hesapla Giriş Yap
          </Link>

          <button
            onClick={handleSwitchToAdmin}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-xl transition border border-blue-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            [Test / Demo]: Yönetici Rolüne Geç ve Panele Dön
          </button>
        </div>
      </div>
    </div>
  );
}
