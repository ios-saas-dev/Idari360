"use client";

import { useState } from "react";
import { Building2, Search, Filter, AlertCircle, Droplets, Bug, Sparkles, Coins } from "lucide-react";
import { facilitiesList } from "@/lib/mock-data";
import { Facility } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

export default function SubelerPage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility>(facilitiesList[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFacilities = facilitiesList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Şubeler — 360° Tesis Karnesi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            47 şubenin temizlik, ilaçlama, Waternet su arıtma ve maliyet performansının tek merkezden takibi.
          </p>
        </div>

        {/* 47 Facility Status Pills (Faz 6 Konsolide) */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-xs font-bold">
          <span className="text-slate-400">47 Şube:</span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">🟢 38 İyi Durumda</span>
          <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">🟡 7 Takip Gerekiyor</span>
          <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">🔴 2 Kritik</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Facilities List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Şube veya il ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredFacilities.map((f) => {
              const isSelected = selectedFacility.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFacility(f)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{f.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        f.health_status === "good"
                          ? "bg-emerald-500"
                          : f.health_status === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>{f.city} • {f.code}</span>
                    <span className="font-semibold text-slate-700">★ {f.satisfaction_score} / 5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 360 Degree Facility Scorecard */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedFacility.code}
                </span>
                <h2 className="text-xl font-black text-slate-900">{selectedFacility.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedFacility.address} — Tel: {selectedFacility.phone}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Genel Sağlık Durumu</span>
              <div
                className={`text-sm font-bold mt-0.5 uppercase ${
                  selectedFacility.health_status === "good"
                    ? "text-emerald-600"
                    : selectedFacility.health_status === "warning"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                ● {selectedFacility.health_status === "good" ? "Sorunsuz & Uygun" : selectedFacility.health_status === "warning" ? "Takip Gerekiyor" : "Kritik Aksiyon Var"}
              </div>
            </div>
          </div>

          {/* 4 Pillars of 360 Degree Facility Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Temizlik */}
            <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold">Temizlik & Hijyen</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                %{selectedFacility.cleanliness_score}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Son denetim puanı</p>
            </div>

            {/* 2. İlaçlama */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Bug className="w-4 h-4" />
                <span className="text-xs font-bold">İlaçlama & Haşere</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                %{selectedFacility.pest_control_score}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Yem istasyonları uygun</p>
            </div>

            {/* 3. Waternet */}
            <div className="bg-cyan-50/60 rounded-2xl p-4 border border-cyan-100">
              <div className="flex items-center gap-2 text-cyan-700 mb-2">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-bold">Waternet Su Arıtma</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                %{selectedFacility.waternet_score}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Filtre & TDS test değeri</p>
            </div>

            {/* 4. Maliyet */}
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <span className="font-bold text-sm">₺</span>
                <span className="text-xs font-bold">Aylık İdari Maliyet</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {formatCurrency(selectedFacility.monthly_cost)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Yemek + Servis + Temizlik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
