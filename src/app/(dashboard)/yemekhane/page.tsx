"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Utensils,
  ShieldCheck,
  TrendingUp,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  RefreshCw,
  Truck,
  Sparkles,
} from "lucide-react";
import { SatisfactionGauge } from "@/components/dashboard/SatisfactionGauge";
import { getSuppliers } from "@/lib/services/suppliers-service";
import { getFacilities } from "@/lib/services/facilities-service";
import { Supplier, Facility } from "@/lib/supabase/types";

export default function YemekhanePage() {
  const [cateringSupplier, setCateringSupplier] = useState<Supplier | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily menu state
  const [dailyMenu, setDailyMenu] = useState([
    { type: "Çorba", name: "Ezogelin Çorbası", cal: "140 kcal" },
    { type: "Ana Yemek", name: "Fırında İzmir Köfte & Fırın Patates", cal: "480 kcal" },
    { type: "Yardımcı Yemek", name: "Pirinç Pilavı", cal: "260 kcal" },
    { type: "Tatlı / İçecek", name: "Mevsim Salata & Ayran", cal: "95 kcal" },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suppliers, facs] = await Promise.all([
        getSuppliers("Yemekhane"),
        getFacilities(),
      ]);
      if (suppliers.length > 0) {
        setCateringSupplier(suppliers[0]);
      }
      setFacilities(facs);
    } catch (err) {
      console.error("Yemekhane load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute average satisfaction score across facilities
  const avgSatisfaction =
    facilities.length > 0
      ? Number(
          (
            facilities.reduce((acc, f) => acc + Number(f.satisfaction_score || 0), 0) /
            facilities.length
          ).toFixed(1)
        )
      : 4.6;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Yemekhane & Catering Süreç Yönetimi (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Günlük menü planlaması, üretim/tüketim sayıları, Diversey hijyen standartları ve anket memnuniyeti.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/denetimler/yemekhane"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Yerinde Üretim Denetimi (34 Soru / 100 P)
          </Link>

          <Link
            href="/denetimler/yemekhane_tasima"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Truck className="w-4 h-4" />
            Taşıma Yemek Denetimi (24 Soru / 100 P)
          </Link>
        </div>
      </div>

      {/* Row 1: KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Günlük Konsolide Tüketim</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1,420 Porsiyon</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {facilities.length > 0 ? `${facilities.length} Şube Aktif` : "Tüm Şubeler"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Ortalama Hijyen Skoru</div>
          <div className="text-2xl font-black text-slate-900 mt-1">94.5 / 100</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Diversey & HACCP Gıda Standartlarına Uygun
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Porsiyon Maliyeti</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₺84.50</div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            Bütçe Hedefi: ₺90.00 (%6.1 Avantaj)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Tedarikçi Karnesi (SLA)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {cateringSupplier ? `${cateringSupplier.overall_score} / 100` : "88.3 / 100"}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {cateringSupplier ? cateringSupplier.name : "Gourmet Catering & Yemek San."}
          </div>
        </div>
      </div>

      {/* Row 2: Today's Menu & Satisfaction Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Menu Plan */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Günün Menüsü
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Öğle Servisi Menü Planı
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              Kalori: ~975 kcal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dailyMenu.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.type}
                  </span>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {item.name}
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                  {item.cal}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100/60 flex items-center justify-between text-xs text-blue-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Gıda Güvenliği: Şahit numuneler 72 saat süreyle numune dolabında saklanmaktadır.</span>
            </div>
            <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              Kayıt: 4°C
            </span>
          </div>
        </div>

        {/* Satisfaction Gauge Widget */}
        <div className="lg:col-span-4 min-h-[300px]">
          <SatisfactionGauge
            score={avgSatisfaction}
            maxScore={5}
            title="Yemekhane Memnuniyet Ortalaması"
            growth="+0.3 Puan (Son 30 Gün)"
          />
        </div>
      </div>

      {/* Row 3: Catering Supplier 6-KPI Detailed Scorecard from Supabase */}
      {cateringSupplier && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Catering Tedarikçi Performans Karnesi (SLA 6 Kriter)
              </h3>
              <p className="text-xs text-slate-400">
                {cateringSupplier.name} firmasına ait Supabase veritabanında kayıtlı aylık değerlendirme skorları.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Genel Ağırlıklı Skor</span>
              <span className="text-xl font-black text-emerald-600">
                {cateringSupplier.overall_score} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Hizmet Kalitesi</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.service_quality_score}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Hedef: 85+</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Zamanında Teslim</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.punctuality_score}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Hedef: 90+</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Şikayet Çözüm</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.complaint_score}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Takipte</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Personel Uyumu</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.staff_compliance_score}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Hedef: 90+</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Denetim Başarısı</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.audit_score}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">HACCP Onaylı</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">DÖF Kapama</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {cateringSupplier.action_closure_score}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Zamanında</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
