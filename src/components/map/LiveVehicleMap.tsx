"use client";

import { useState, useEffect } from "react";
import {
  Navigation,
  Thermometer,
  Wind,
  Users,
  ShieldCheck,
  Phone,
  Clock,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";
import { Vehicle } from "@/lib/supabase/types";
import { vehiclesList } from "@/lib/mock-data";

export function LiveVehicleMap() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesList);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehiclesList[0]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Smooth Telemetry Realtime Simulation (PostGIS / Realtime simulator)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          // Micro GPS coordinates drift to simulate realistic driving
          const latDrift = (Math.random() - 0.5) * 0.0008;
          const lngDrift = (Math.random() - 0.5) * 0.0008;
          const speedDrift = Math.max(20, Math.min(85, v.current_speed + (Math.random() - 0.5) * 4));
          const tempDrift = Number((v.interior_temp + (Math.random() - 0.5) * 0.2).toFixed(1));

          const updated = {
            ...v,
            current_lat: v.current_lat + latDrift,
            current_lng: v.current_lng + lngDrift,
            current_speed: Math.round(speedDrift),
            interior_temp: tempDrift,
          };

          if (selectedVehicle.id === v.id) {
            setSelectedVehicle(updated);
          }

          return updated;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, selectedVehicle.id]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[620px]">
      {/* Left / Main Map Canvas Area */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
        {/* Interactive Map Visualizer Canvas */}
        <div className="absolute inset-0 bg-[#091326] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          {/* Simulated Road Grid Lines */}
          <svg className="w-full h-full opacity-30 pointer-events-none">
            <path d="M 0 100 Q 300 150 600 80 T 1200 140" fill="none" stroke="#3b82f6" strokeWidth="6" />
            <path d="M 200 0 Q 250 300 400 600" fill="none" stroke="#0ea5e9" strokeWidth="4" />
            <path d="M 50 450 Q 400 350 900 500" fill="none" stroke="#6366f1" strokeWidth="5" />
          </svg>

          {/* Vehicle Markers */}
          {vehicles.map((v, idx) => {
            const isSelected = selectedVehicle.id === v.id;
            // Map fake coords to percentage bounds
            const posX = 20 + ((idx * 28 + (v.current_lat * 100)) % 65);
            const posY = 25 + ((idx * 22 + (v.current_lng * 100)) % 55);

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                  transition: "all 2s ease-in-out",
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group`}
              >
                {/* Pulse wave animation */}
                <span className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping" />

                {/* Marker Pin */}
                <div
                  className={`px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-transform ${
                    isSelected
                      ? "bg-blue-600 text-white scale-110 ring-4 ring-blue-500/30"
                      : "bg-white text-slate-800 hover:scale-105"
                  }`}
                >
                  <Navigation
                    className={`w-3.5 h-3.5 rotate-45 ${
                      isSelected ? "text-cyan-300" : "text-blue-600"
                    }`}
                  />
                  <span className="text-[11px] font-black">{v.plate}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      v.interior_temp > 24 ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {v.interior_temp}°C
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Header Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Canlı GPS Takibi (Mapbox GL + Supabase Realtime)
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">{vehicles.length} Aktif Araç İzleniyor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-white/10 text-white text-xs font-semibold rounded-2xl flex items-center gap-1.5 hover:bg-slate-800 transition"
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" /> Canlı Akışı Duraklat
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Canlı Akışı Başlat
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white text-[11px] space-y-1.5 z-20">
          <div className="font-bold text-slate-300 text-[10px] uppercase">Telemetri Sensörleri</div>
          <div className="flex items-center gap-2 text-slate-300">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kabin Sıcaklık Sensörü Entegre</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            <span>Klima Telemetrisi (OBD-II / CanBus)</span>
          </div>
        </div>
      </div>

      {/* Right Drawer: Selected Vehicle Live Telemetry Card */}
      <div className="w-full lg:w-96 bg-white p-6 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-100">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {selectedVehicle.vehicle_type === "servis" ? "Personel Servisi" : "Filo Aracı"}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {selectedVehicle.plate}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.model_year})
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">
                {selectedVehicle.current_speed}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">km/s</span>
            </div>
          </div>

          {/* Route info */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mt-4 text-xs">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Aktif Rota</div>
            <div className="font-bold text-slate-800 mt-0.5">{selectedVehicle.route_name}</div>
          </div>

          {/* Telemetry Sensor Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            {/* Interior Temperature */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Thermometer className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-semibold">İç Sıcaklık</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {selectedVehicle.interior_temp}°C
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">İdeal Aralık (21-24°C)</span>
            </div>

            {/* AC Status */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Wind className="w-4 h-4 text-cyan-500" />
                <span className="text-[11px] font-semibold">Klima</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {selectedVehicle.ac_status ? "Aktif" : "Kapalı"}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Otomatik Mod</span>
            </div>

            {/* Capacity / Passengers */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-semibold">Doluluk Oranı</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                %{Math.round((selectedVehicle.passenger_count / selectedVehicle.capacity) * 100)}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                {selectedVehicle.passenger_count} / {selectedVehicle.capacity} Yolcu
              </span>
            </div>

            {/* Cleanliness / Audit Score */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-semibold">Denetim Puanı</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {selectedVehicle.cleanliness_score}/100
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Temiz & Güvenli</span>
            </div>
          </div>

          {/* Driver Information */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">Sürücü & Belge Durumu</h4>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Sürücü:</span>
              <span className="font-bold text-slate-900">{selectedVehicle.driver_name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">İletişim:</span>
              <a
                href={`tel:${selectedVehicle.driver_phone}`}
                className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3 h-3" />
                {selectedVehicle.driver_phone}
              </a>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">SRC & Psikoteknik:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                ✓ Güncel & Onaylı
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <a
            href="/denetimler/servis"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition"
          >
            Bu Araca Servis Denetimi Başlat
          </a>
        </div>
      </div>
    </div>
  );
}
