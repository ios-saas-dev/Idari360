"use client";

import Link from "next/link";
import { Bus, Utensils, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Download } from "lucide-react";

export default function DenetimlerIndexPage() {
  const auditTypes = [
    {
      title: "Servis Aracı Denetimi",
      desc: "Araç içi/dışı temizlik, klima performansı, emniyet kemerleri, yangın tüpü, ilk yardım, sürücü evrakları.",
      href: "/denetimler/servis",
      icon: Bus,
      points: "100 Puan",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Yemekhane & HACCP Denetimi",
      desc: "Hazırlık, pişirme, servis alanı, alet ekipmanlar, sanitasyon, Diversey hijyen kuralları ve soyunma odaları.",
      href: "/denetimler/yemekhane",
      icon: Utensils,
      points: "100 Puan (34 Soru)",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Tesis & Saha Temizlik Denetimi",
      desc: "Operasyon alanı, binicili makine kullanımı, WC ve soyunma odaları, mola alanları ve ofis hijyeni.",
      href: "/denetimler/temizlik",
      icon: Sparkles,
      points: "100 Puan (18 Soru)",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Denetim & Kontrol Merkezi
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Tüm tesis, servis ve yemekhane denetimlerini tek merkezden başlatın, puanlayın ve aksiyonları takip edin.
        </p>
      </div>

      {/* 3 Main Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {auditTypes.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {item.points}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Denetime Başla</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Open Corrective Action Items Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Açık Aksiyon ve Uygunsuzluk Takibi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Denetimlerde &apos;Hayır&apos; olarak işaretlenen ve termin tarihi verilen maddeler.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            34 Açık Aksiyon
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Aksiyon No</th>
                <th className="py-3 px-4">Açıklama / Uygunsuzluk</th>
                <th className="py-3 px-4">Tesis / Araç</th>
                <th className="py-3 px-4">Sorumlu</th>
                <th className="py-3 px-4">Termin (Deadline)</th>
                <th className="py-3 px-4">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-600">AKS-2026-088</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  34 ABC 123 servis aracı yangın tüpü dolum süresi kontrolü
                </td>
                <td className="py-3.5 px-4 text-slate-500">34 ABC 123 (Kadıköy)</td>
                <td className="py-3.5 px-4 text-slate-600">Ali Öztürk</td>
                <td className="py-3.5 px-4 font-bold text-red-600">05.06.2026 (Kritik)</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">
                    DEVAM EDİYOR
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-amber-600">AKS-2026-087</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  Agora Yemekhane el yıkama istasyonu pedallı çöp kovası temini
                </td>
                <td className="py-3.5 px-4 text-slate-500">Agora Şubesi</td>
                <td className="py-3.5 px-4 text-slate-600">Catering Şefi</td>
                <td className="py-3.5 px-4 font-bold text-slate-700">08.06.2026</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                    AÇIK
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
