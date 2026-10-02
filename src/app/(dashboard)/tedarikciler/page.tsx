"use client";

import { useState, useEffect } from "react";
import { Award, Star, CheckCircle, AlertTriangle, Phone, Mail, Loader2 } from "lucide-react";
import { Supplier } from "@/lib/supabase/types";
import { getSuppliers } from "@/lib/services/suppliers-service";

export default function TedarikcilerPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getSuppliers();
      setSuppliers(data);
      if (data.length > 0) setSelectedSupplier(data[0]);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading || !selectedSupplier) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tedarikçi & Firma Performans Karnesi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Temizlik, servis, yemekhane ve güvenlik iş ortaklarının SLA, denetim ve aksiyon kapatma başarıları.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Ortalama Tedarikçi Başarısı: %90.5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Supplier List Cards */}
        <div className="lg:col-span-4 space-y-3">
          {suppliers.map((sup) => {
            const isSelected = selectedSupplier.id === sup.id;
            return (
              <div
                key={sup.id}
                onClick={() => setSelectedSupplier(sup)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {sup.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{sup.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">{sup.overall_score}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">/ 100</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>Yetkili: {sup.contact_person}</span>
                  <span className="font-semibold text-emerald-600">SLA Uygun</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Supplier Detailed Scorecard */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {selectedSupplier.category} HİZMET ORTAĞI
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {selectedSupplier.name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span>Yetkili: {selectedSupplier.contact_person}</span>
                <span>•</span>
                <span>Tel: {selectedSupplier.phone}</span>
                <span>•</span>
                <span>E-posta: {selectedSupplier.email}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Genel Performans</span>
              <div className="text-3xl font-black text-blue-600">
                {selectedSupplier.overall_score} <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* 6 Key Criteria Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kriter ve Değerlendirme Skorları
            </h4>

            <div className="space-y-3">
              {[
                { label: "Hizmet Kalitesi", score: selectedSupplier.service_quality_score, color: "#3b82f6" },
                { label: "Zamanında Hizmet", score: selectedSupplier.punctuality_score, color: "#06b6d4" },
                { label: "Şikayet Yönetimi", score: selectedSupplier.complaint_score, color: "#f59e0b" },
                { label: "Personel Uygunluğu", score: selectedSupplier.staff_compliance_score, color: "#10b981" },
                { label: "Denetim Sonuçları", score: selectedSupplier.audit_score, color: "#8b5cf6" },
                { label: "Aksiyon Kapatma", score: selectedSupplier.action_closure_score, color: "#6366f1" },
              ].map((crit, idx) => (
                <div key={idx} className="flex items-center gap-4 text-xs">
                  <span className="w-36 font-semibold text-slate-700 text-xs shrink-0">
                    {crit.label}
                  </span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${crit.score}%`,
                        backgroundColor: crit.color,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-black text-slate-900 text-xs">
                    %{crit.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
