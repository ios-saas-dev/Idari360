"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bus,
  Plus,
  ShieldCheck,
  Thermometer,
  Wind,
  Phone,
  X,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { LiveVehicleMap } from "@/components/map/LiveVehicleMap";
import { Vehicle, Facility } from "@/lib/supabase/types";
import { getVehicles, createVehicle } from "@/lib/services/vehicles-service";
import { getFacilities } from "@/lib/services/facilities-service";

export default function ServisPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New vehicle form state
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("Mercedes-Benz");
  const [model, setModel] = useState("Sprinter 16+1");
  const [modelYear, setModelYear] = useState(2024);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [capacity, setCapacity] = useState(16);
  const [routeName, setRouteName] = useState("");
  const [facilityId, setFacilityId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, fData] = await Promise.all([
        getVehicles("servis"),
        getFacilities(),
      ]);
      setVehicles(vData);
      setFacilities(fData);
      if (fData.length > 0 && !facilityId) {
        setFacilityId(fData[0].id);
      }
    } catch (err) {
      console.error("Servis data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !driverName) {
      alert("Lütfen plaka ve sürücü adını doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createVehicle({
        plate: plate.toUpperCase().trim(),
        vehicle_type: "servis",
        brand,
        model,
        model_year: Number(modelYear),
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim(),
        capacity: Number(capacity),
        passenger_count: 0,
        route_name: routeName.trim(),
        facility_id: facilityId || undefined,
        current_lat: 41.0082,
        current_lng: 28.9784,
        interior_temp: 22.0,
        ac_status: true,
        cleanliness_score: 95.0,
      });

      setVehicles([created, ...vehicles]);
      setIsModalOpen(false);
      setPlate("");
      setDriverName("");
      setDriverPhone("");
      setRouteName("");
    } catch (err: any) {
      alert("Araç eklenirken bir hata oluştu: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Servis Yönetimi & Canlı GPS Takip (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Personel servis araçları, güzergahlar, canlı GPS konumu, kabin sıcaklığı ve sürücü denetimleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Yeni Servis Aracı Ekle
          </button>

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
      <LiveVehicleMap vehicleType="servis" />

      {/* Fleet Overview Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kayıtlı Servis Araçları ve Canlı Telemetri Durumu
            </h3>
            <p className="text-xs text-slate-400">
              Supabase PostgreSQL veritabanından anlık çekilen servis kayıtları.
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
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {v.plate}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {v.brand} {v.model} ({v.model_year})
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {v.route_name || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.driver_name}</div>
                    <div className="text-[10px] text-slate-400">{v.driver_phone || "—"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        {v.interior_temp}°C
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                          v.ac_status
                            ? "text-blue-600 bg-blue-50"
                            : "text-slate-400 bg-slate-50"
                        }`}
                      >
                        <Wind className="w-3 h-3" />
                        {v.ac_status ? "Açık" : "Kapalı"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {v.passenger_count || 0} / {v.capacity}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">
                      {v.cleanliness_score || 95} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/denetimler/servis?vehicleId=${v.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Denetle
                    </Link>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Kayıtlı servis aracı bulunamadı. Yeni bir araç ekleyin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Service Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Yeni Servis Aracı Ekle
                </h3>
                <p className="text-xs text-slate-500">
                  Supabase veritabanına yeni servis güzergah aracı tanımlayın.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Araç Plakası *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="34 ABC 123"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bağlı Olduğu Şube
                  </label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Yıl
                  </label>
                  <input
                    type="number"
                    required
                    value={modelYear}
                    onChange={(e) => setModelYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sürücü Adı Soyadı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ali Yılmaz"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sürücü Telefon
                  </label>
                  <input
                    type="text"
                    placeholder="0532 000 00 00"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Güzergah / Hat Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Kadıköy - Maslak Ekspres"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kapasite
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="text-[11px] font-semibold">
                  Sürücü SRC & Psikoteknik belgeleri sisteme eklendiğinde otomatik geçerli işaretlenecektir.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Aracı Veritabanına Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
