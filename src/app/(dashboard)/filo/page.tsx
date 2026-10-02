"use client";

import { Car, Wrench, Fuel, Shield, AlertTriangle } from "lucide-react";
import { LiveVehicleMap } from "@/components/map/LiveVehicleMap";

export default function FiloPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Şirket Filo Yönetimi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Operasyon ve saha binek araçları, yakıt optimizasyonu, periyodik bakım ve canlı GPS izleme.
          </p>
        </div>

        <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2">
          <Car className="w-4 h-4" />
          Yeni Filo Aracı Ekle
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Toplam Filo Varlığı</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">28 Araç</div>
            <div className="text-[11px] text-emerald-600 font-medium">26 Aktif Sahada • 2 Bakımda</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Yaklaşan Bakımlar</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">4 Araç</div>
            <div className="text-[11px] text-amber-600 font-medium">30 gün içinde muayene & bakım</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Ortalama Yakıt Tasarrufu</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">%14.2</div>
            <div className="text-[11px] text-emerald-600 font-medium">Akıllı rota optimizasyonu ile</div>
          </div>
        </div>
      </div>

      {/* Map visualizer */}
      <LiveVehicleMap />
    </div>
  );
}
