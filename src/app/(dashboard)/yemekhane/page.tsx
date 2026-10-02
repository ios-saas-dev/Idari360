"use client";

import Link from "next/link";
import {
  Utensils,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import { SatisfactionGauge } from "@/components/dashboard/SatisfactionGauge";

export default function YemekhanePage() {
  const dailyMenu = [
    { type: "Çorba", name: "Ezogelin Çorbası", cal: "140 kcal" },
    { type: "Ana Yemek", name: "Fırında İzmir Köfte & Fırın Patates", cal: "480 kcal" },
    { type: "Yardımcı Yemek", name: "Pirinç Pilavı", cal: "260 kcal" },
    { type: "Tatlı / İçecek", name: "Mevsim Salata & Ayran", cal: "95 kcal" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Yemekhane & Catering Süreç Yönetimi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Günlük menü planlaması, üretim/tüketim sayıları, Diversey hijyen standartları ve anket memnuniyeti.
          </p>
        </div>

        <Link
          href="/denetimler/yemekhane"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition"
        >
          <ShieldCheck className="w-4 h-4" />
          Yemekhane Hijyen Denetimi Başlat (100 Puan)
        </Link>
      </div>

      {/* Row 1: KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Günlük Tüketim</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1,420 Porsiyon</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            47 Şube Konsolide
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Ortalama Hijyen Skoru</div>
          <div className="text-2xl font-black text-slate-900 mt-1">94.5 / 100</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Diversey & Gıda Standartlarına Uygun
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Porsiyon Maliyeti</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₺84.50</div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            Bütçe Hedefi: ₺90.00
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Tedarikçi Karnesi</div>
          <div className="text-2xl font-black text-slate-900 mt-1">88.3 / 100</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Gourmet Catering & Yemek San.
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
                30 Mayıs 2026 Cuma — Öğle Servisi
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
        </div>

        {/* Satisfaction Gauge Widget */}
        <div className="lg:col-span-4 min-h-[300px]">
          <SatisfactionGauge />
        </div>
      </div>
    </div>
  );
}
