"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Recycle,
  CheckCircle,
  Clock,
  Plus,
  Scale,
  CalendarCheck,
  X,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { getWasteLogs, createWasteLog } from "@/lib/services/waste-service";
import {
  getAtsSchedules,
  createAtsProposal,
  respondToAtsProposal,
  AtsScheduleRecord,
} from "@/lib/services/ats-service";
import { getFacilities } from "@/lib/services/facilities-service";
import { Facility } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

export default function TemizlikPage() {
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [atsSchedules, setAtsSchedules] = useState<AtsScheduleRecord[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Waste form state
  const [selectedFacilityWaste, setSelectedFacilityWaste] = useState("");
  const [cardboardKg, setCardboardKg] = useState<number>(350);
  const [nylonKg, setNylonKg] = useState<number>(120);
  const [containerCode, setContainerCode] = useState("KNT-01");
  const [operator, setOperator] = useState("Ahmet Kantar Sorumlusu");

  // ATS form state
  const [selectedFacilityAts, setSelectedFacilityAts] = useState("");
  const [cleaningType, setCleaningType] = useState("Genel Zemin & Cam Yıkama");
  const [proposedDate, setProposedDate] = useState("2026-06-15");

  const loadData = async () => {
    setLoading(true);
    try {
      const [wData, aData, fData] = await Promise.all([
        getWasteLogs(),
        getAtsSchedules(),
        getFacilities(),
      ]);
      setWasteLogs(wData);
      setAtsSchedules(aData);
      setFacilities(fData);
      if (fData.length > 0) {
        if (!selectedFacilityWaste) setSelectedFacilityWaste(fData[0].id);
        if (!selectedFacilityAts) setSelectedFacilityAts(fData[0].id);
      }
    } catch (err) {
      console.error("Temizlik load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWasteLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createWasteLog({
        facility_id: selectedFacilityWaste,
        cardboard_kg: Number(cardboardKg),
        plastic_nylon_kg: Number(nylonKg),
        container_code: containerCode,
        scale_operator: operator,
      });
      await loadData();
      setIsWasteModalOpen(false);
    } catch {
      alert("Atık tartım kaydı kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAtsProposal({
        facility_id: selectedFacilityAts,
        cleaning_type: cleaningType,
        proposed_date: proposedDate,
      });
      await loadData();
      setIsAtsModalOpen(false);
    } catch {
      alert("ATS randevu önerisi kaydedilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAtsDecision = async (id: string, decision: "onayla" | "yeni_tarih") => {
    try {
      await respondToAtsProposal(id, decision);
      await loadData();
    } catch {
      alert("ATS işlemi sırasında hata oluştu.");
    }
  };

  // Compute total cardboard, nylon, and revenue
  const totalCardboard = wasteLogs.reduce((acc, l) => acc + Number(l.cardboard_kg || 0), 0);
  const totalNylon = wasteLogs.reduce((acc, l) => acc + Number(l.plastic_nylon_kg || 0), 0);
  const totalRevenue = wasteLogs.reduce((acc, l) => acc + Number(l.calculated_revenue || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tesis Temizlik & Hijyen Yönetimi (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Saha temizliği, makine parkı, kantar tartımlı geri dönüşüm takibi ve ATS temizlik onay akışı.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsWasteModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition"
          >
            <Scale className="w-4 h-4" />
            Kantar Tartımı Ekle
          </button>

          <button
            onClick={() => setIsAtsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <CalendarCheck className="w-4 h-4" />
            ATS Temizlik Planla
          </button>

          <Link
            href="/denetimler/temizlik"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Temizlik Denetimi (100 Puan)
          </Link>
        </div>
      </div>

      {/* Sustainability & Recycling Highlight Box (Excel Akıllı Atık Şartı) */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Recycle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Sıfır Atık & Akıllı Kantar Takibi
            </span>
            <h3 className="text-lg font-black mt-0.5">Karton & Naylon Geri Dönüşüm Geliri</h3>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
              Her konteyner dijital kantarla tartılır. Günlük karton ve naylon kg raporları Supabase veritabanında saklanır ve birim fiyat üzerinden otomatik getiri hesaplanır.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center shrink-0 min-w-[220px]">
          <div className="text-xs text-emerald-200">Kayıtlı Geri Dönüşüm</div>
          <div className="text-2xl font-black text-white mt-0.5">
            {(totalCardboard + totalNylon).toLocaleString()} kg
          </div>
          <div className="text-[11px] text-emerald-300 font-bold mt-0.5">
            +{formatCurrency(totalRevenue || (totalCardboard * 2.5 + totalNylon * 4.0))} Tahmini Gelir
          </div>
        </div>
      </div>

      {/* Grid: ATS Schedules on Left, Waste Scale Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ATS Schedules Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ATS — Temizlik Takvimi & Şube Onay Süreci
              </h3>
              <p className="text-xs text-slate-400">
                Firma önerisi → Şube onayı → Temizlik bitimi → Denetim onay döngüsü.
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Tesis</th>
                  <th className="py-3 px-3">Temizlik Tipi</th>
                  <th className="py-3 px-3">Önerilen Tarih</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {atsSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {item.facilities?.name || "Agora Şubesi"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.cleaning_type}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.proposed_date}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === "sube_onayladi"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "firma_oneri_yapti"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status === "firma_oneri_yapti"
                          ? "Firma Önerdi"
                          : item.status === "sube_onayladi"
                          ? "Şube Onayladı"
                          : item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.status === "firma_oneri_yapti" && (
                        <button
                          onClick={() => handleAtsDecision(item.id, "onayla")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition"
                        >
                          Onayla
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {atsSchedules.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Aktif ATS temizlik randevusu bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waste Logs Table */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Son Kantar Tartımları
              </h3>
              <p className="text-xs text-slate-400">
                Dijital kantar atık kayıtları (Karton/Naylon).
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {wasteLogs.length} Kayıt
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Tarih</th>
                  <th className="py-3 px-3">Karton (kg)</th>
                  <th className="py-3 px-3">Naylon (kg)</th>
                  <th className="py-3 px-3">Konteyner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {wasteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {log.log_date || "Bugün"}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {log.cardboard_kg} kg
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-600">
                      {log.plastic_nylon_kg} kg
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {log.container_code || "KNT-01"}
                    </td>
                  </tr>
                ))}
                {wasteLogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Henüz kantar tartım kaydı girilmedi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waste Modal */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Yeni Kantar Tartımı Ekle (Akıllı Atık)
              </h3>
              <button
                onClick={() => setIsWasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWasteLog} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Şube / Tesis *
                </label>
                <select
                  value={selectedFacilityWaste}
                  onChange={(e) => setSelectedFacilityWaste(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Karton Ağırlığı (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={cardboardKg}
                    onChange={(e) => setCardboardKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Naylon Ağırlığı (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={nylonKg}
                    onChange={(e) => setNylonKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Konteyner Kodu
                  </label>
                  <input
                    type="text"
                    value={containerCode}
                    onChange={(e) => setContainerCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kantar Operatörü
                  </label>
                  <input
                    type="text"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kantar Verisini Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATS Modal */}
      {isAtsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Yeni ATS Temizlik Planı Öner
              </h3>
              <button
                onClick={() => setIsAtsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAts} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Şube / Tesis *
                </label>
                <select
                  value={selectedFacilityAts}
                  onChange={(e) => setSelectedFacilityAts(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temizlik Hizmet Tipi *
                </label>
                <input
                  type="text"
                  required
                  value={cleaningType}
                  onChange={(e) => setCleaningType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Önerilen Tarih *
                </label>
                <input
                  type="date"
                  required
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAtsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "ATS Randevusunu İlet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
