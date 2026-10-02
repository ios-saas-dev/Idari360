"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Recycle, CheckCircle, Clock } from "lucide-react";

export default function TemizlikPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tesis Temizlik & Hijyen Yönetimi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Saha ve operasyon alanı temizliği, makine parkı, geri dönüşüm tartım takibi ve ATS temizlik onay akışı.
          </p>
        </div>

        <Link
          href="/denetimler/temizlik"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition"
        >
          <ShieldCheck className="w-4 h-4" />
          Temizlik Denetim Formu Başlat (100 Puan)
        </Link>
      </div>

      {/* Sustainability & Recycling Highlight Box (Word doc requirement) */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Sıfır Atık & Çevre Hedefleri
            </span>
            <h3 className="text-lg font-black mt-0.5">Karton & Naylon Geri Dönüşüm Takibi</h3>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
              Her konteyner dolduğunda dijital kantarla tartılır. Günlük karton ve naylon kg raporları otomatik alınarak aylık geri dönüşüm geliri hesaplanır ve atık kaybı minimize edilir.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center shrink-0">
          <div className="text-xs text-emerald-200">Bu Ayki Geri Dönüşüm</div>
          <div className="text-2xl font-black text-white mt-0.5">14,850 kg</div>
          <div className="text-[11px] text-emerald-300 font-bold mt-0.5">+₺38,400 Geri Dönüşüm Geliri</div>
        </div>
      </div>

      {/* Equipment & Machinery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Binicili Yıkama Makineleri</div>
          <div className="text-2xl font-black text-slate-900 mt-1">12 Adet</div>
          <div className="text-[11px] text-slate-400 font-medium">Taski & Kärcher Modelleri</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Kokulandırma & Hijyen Üniteleri</div>
          <div className="text-2xl font-black text-slate-900 mt-1">94 Cihaz</div>
          <div className="text-[11px] text-emerald-600 font-medium">%100 Aktif ve Dolumu Tam</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">İlaçlama Periyodu</div>
          <div className="text-2xl font-black text-slate-900 mt-1">15 Günde Bir</div>
          <div className="text-[11px] text-blue-600 font-medium">Sonraki: 12 Haziran 2026</div>
        </div>
      </div>
    </div>
  );
}
