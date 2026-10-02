"use client";

import { Download, FileText, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { dashboardStats, facilitiesList } from "@/lib/mock-data";

export default function RaporlarPage() {
  const exportExecutiveReportPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("İdari 360 — Konsolide Yönetici Raporu", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Rapor Dönemi: Mayıs 2026 | Üretim Tarihi: 30 Mayıs 2026`, 14, 28);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("47 Şube Konsolide Tesis Sağlık Özeti:", 14, 38);

    autoTable(doc, {
      startY: 44,
      head: [["Şube Kodu", "Şube Adı", "Şehir", "Durum", "Hijyen", "Maliyet"]],
      body: facilitiesList.map((f) => [
        f.code,
        f.name,
        f.city,
        f.health_status === "good" ? "İyi" : f.health_status === "warning" ? "Takip" : "Kritik",
        `%${f.cleanliness_score}`,
        `TL ${f.monthly_cost.toLocaleString("tr-TR")}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`Idari360_Yonetici_Raporu_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Yönetici Raporları & Denetim Özeti
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Konsolide operasyon göstergeleri, şube karne dağılımı ve otomatik periyodik raporlar.
          </p>
        </div>

        <button
          onClick={exportExecutiveReportPdf}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
        >
          <Download className="w-4 h-4" />
          Yönetici PDF Raporu İndir
        </button>
      </div>

      {/* Faz 6 Executive KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Şube Sayısı</div>
          <div className="text-2xl font-black text-slate-900 mt-1">47 Şube</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">38 İyi • 7 Takip • 2 Kritik</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Açık Aksiyonlar</div>
          <div className="text-2xl font-black text-amber-600 mt-1">34</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">Termin takibinde</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Bu Ay Tamamlanan</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">216</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">+%12.4 artış</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Tedarikçi Skoru</div>
          <div className="text-2xl font-black text-blue-600 mt-1">%91.0</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">0.91 SLA başarısı</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Memnuniyet Skoru</div>
          <div className="text-2xl font-black text-purple-600 mt-1">4.6 / 5</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">Yemekhane & Servis</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[11px] font-semibold text-slate-400">Açık Talepler</div>
          <div className="text-2xl font-black text-slate-900 mt-1">12</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Onay sürecinde</div>
        </div>
      </div>
    </div>
  );
}
