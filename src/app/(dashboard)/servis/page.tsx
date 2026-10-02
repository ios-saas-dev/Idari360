"use client";

import Link from "next/link";
import { Bus, Plus, ShieldCheck, Thermometer, Wind } from "lucide-react";
import { LiveVehicleMap } from "@/components/map/LiveVehicleMap";
import { vehiclesList } from "@/lib/mock-data";

export default function ServisPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Servis Yönetimi & Canlı Takip
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Personel servis araçları, güzergahlar, canlı GPS konumu, kabin sıcaklığı ve sürücü denetimleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/denetimler/servis"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Servis Denetimi Başlat
          </Link>
        </div>
      </div>

      {/* Live Map & Telemetry Visualizer */}
      <LiveVehicleMap />

      {/* Fleet Overview Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Kayıtlı Servis Araçları ve Güzergah Durumu
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Plaka</th>
                <th className="py-3 px-4">Model & Yıl</th>
                <th className="py-3 px-4">Güzergah</th>
                <th className="py-3 px-4">Sürücü & Telefon</th>
                <th className="py-3 px-4">İç Sıcaklık / Klima</th>
                <th className="py-3 px-4">Doluluk</th>
                <th className="py-3 px-4">Denetim Skoru</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vehiclesList.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {v.plate}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {v.brand} {v.model} ({v.model_year})
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {v.route_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.driver_name}</div>
                    <div className="text-[10px] text-slate-400">{v.driver_phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        {v.interior_temp}°C
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                        <Wind className="w-3 h-3" />
                        Açık
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {v.passenger_count} / {v.capacity}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">
                      {v.cleanliness_score} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/denetimler/servis"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Denetle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
