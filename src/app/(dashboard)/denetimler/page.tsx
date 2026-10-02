"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bus,
  Utensils,
  Sparkles,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DenetimlerIndexPage() {
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auditTypes = [
    {
      title: "Servis Aracı Denetimi",
      desc: "Araç içi/dışı temizlik, klima performansı, emniyet kemerleri, yangın tüpü, ilk yardım, sürücü evrakları.",
      href: "/denetimler/servis",
      icon: Bus,
      points: "100 Puan (12 Soru)",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Yemekhane Yerinde Üretim & HACCP",
      desc: "Hazırlık, pişirme, servis alanı, alet ekipmanlar, sanitasyon, Diversey hijyen kuralları ve soyunma odaları.",
      href: "/denetimler/yemekhane",
      icon: Utensils,
      points: "100 Puan (34 Soru)",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Yemekhane Taşıma Yemek Denetimi",
      desc: "Termobox sıcaklık kontrolü, taşıma kapları hijyeni, alerjen bilgilendirme, servis alanı ve numune saklama.",
      href: "/denetimler/yemekhane_tasima",
      icon: Truck,
      points: "100 Puan (41 Soru)",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
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

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [actionsRes, subRes] = await Promise.all([
        supabase
          .from("action_items")
          .select("*, facilities(name, code)")
          .order("created_at", { ascending: false }),
        supabase
          .from("audit_submissions")
          .select("*, facilities(name, code), audit_templates(title, category)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setActionItems(actionsRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (err) {
      console.error("Denetimler hub error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Denetim & Kontrol Merkezi (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tüm tesis, servis ve yemekhane denetimlerini tek merkezden başlatın, puanlayın ve aksiyonları takip edin.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition"
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 4 Main Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {item.points}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
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

      {/* Recent Submissions and Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Open Corrective Action Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Açık Aksiyon ve Uygunsuzluk Takibi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Denetimlerde &apos;Hayır&apos; olarak işaretlenen ve termin tarihi verilen maddeler.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              {actionItems.length} Kayıtlı Aksiyon
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Aksiyon No</th>
                  <th className="py-3 px-3">Açıklama / Uygunsuzluk</th>
                  <th className="py-3 px-3">Tesis</th>
                  <th className="py-3 px-3">Sorumlu</th>
                  <th className="py-3 px-3">Termin</th>
                  <th className="py-3 px-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {actionItems.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-amber-600">
                      {act.action_number}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {act.description}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {act.facilities?.name || "Tesis"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {act.responsible_person || "İdari İşler"}
                    </td>
                    <td className="py-3 px-3 font-bold text-red-600">
                      {act.due_date || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {actionItems.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Açık uygunsuzluk aksiyonu bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Submissions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Son Yapılan Denetimler
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {submissions.length} Denetim
            </span>
          </div>

          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {sub.audit_templates?.title || "Denetim Formu"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {sub.facilities?.name} • {sub.audit_date}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                    %{sub.percentage_score}
                  </span>
                </div>
              </div>
            ))}
            {submissions.length === 0 && !loading && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Henüz tamamlanmış denetim kaydı bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
