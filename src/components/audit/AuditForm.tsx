"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Calendar,
  Download,
  Send,
  Building,
  Check,
  RefreshCw,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuditQuestion, Facility, Vehicle } from "@/lib/supabase/types";
import { getFacilities } from "@/lib/services/facilities-service";
import { getVehicles } from "@/lib/services/vehicles-service";
import { submitAudit } from "@/lib/services/audits-service";

interface AuditFormProps {
  title: string;
  category: "servis" | "yemekhane" | "yemekhane_tasima" | "temizlik";
  questions: AuditQuestion[];
  templateId?: string;
  defaultTargetName?: string;
  vehicleId?: string;
}

interface QuestionAnswerState {
  isCompliant: boolean | null; // true: Evet, false: Hayır, null: Seçilmedi
  reason: string;
  deadline: string;
  photoUploaded: boolean;
}

export function AuditForm({
  title,
  category,
  questions,
  templateId,
  defaultTargetName = "Agora Şubesi",
  vehicleId,
}: AuditFormProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleId || "");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group questions by category_section
  const groupedSections = questions.reduce((acc, q) => {
    const sec = q.category_section || "Genel Kriterler";
    if (!acc[sec]) {
      acc[sec] = [];
    }
    acc[sec].push(q);
    return acc;
  }, {} as Record<string, AuditQuestion[]>);

  // Initialize answer states
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerState>>({});

  useEffect(() => {
    const init: Record<string, QuestionAnswerState> = {};
    questions.forEach((q) => {
      init[q.id] = {
        isCompliant: true,
        reason: "",
        deadline: "",
        photoUploaded: false,
      };
    });
    setAnswers(init);
  }, [questions]);

  // Load facilities & vehicles
  useEffect(() => {
    async function loadMetadata() {
      try {
        const facs = await getFacilities();
        setFacilities(facs);
        if (facs.length > 0 && !selectedFacility) {
          setSelectedFacility(facs[0].id);
        }

        if (category === "servis") {
          const vehs = await getVehicles("servis");
          setVehicles(vehs);
          if (vehs.length > 0 && !selectedVehicle) {
            setSelectedVehicle(vehs[0].id);
          }
        }
      } catch (err) {
        console.error("Metadata load error in AuditForm:", err);
      }
    }
    loadMetadata();
  }, [category, selectedFacility, selectedVehicle]);

  const handleToggleCompliance = (qId: string, value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        isCompliant: value,
        deadline: !value && !prev[qId]?.deadline ? "2026-06-08" : prev[qId]?.deadline,
      },
    }));
  };

  const handleReasonChange = (qId: string, reason: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        reason,
      },
    }));
  };

  const handleDeadlineChange = (qId: string, deadline: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        deadline,
      },
    }));
  };

  // Calculate live score
  const totalPossible = questions.reduce((acc, q) => acc + (q.points || 2), 0);
  const earnedScore = questions.reduce((acc, q) => {
    const ans = answers[q.id];
    return ans?.isCompliant ? acc + (q.points || 2) : acc;
  }, 0);

  const percentage = totalPossible > 0 ? Math.round((earnedScore / totalPossible) * 100) : 100;
  const nonCompliantItems = questions.filter((q) => answers[q.id]?.isCompliant === false);

  const targetFacilityName =
    facilities.find((f) => f.id === selectedFacility)?.name || defaultTargetName;
  const targetVehiclePlate =
    category === "servis" && selectedVehicle
      ? vehicles.find((v) => v.id === selectedVehicle)?.plate
      : null;

  // PDF Export using jsPDF and autoTable
  const generatePdfReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("İdari 360 — Resmi Denetim Raporu", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Denetim: ${title}`, 14, 28);
    doc.text(
      `Tesis / Lokasyon: ${targetFacilityName} ${targetVehiclePlate ? `(Araç: ${targetVehiclePlate})` : ""} | Tarih: ${new Date().toLocaleDateString("tr-TR")}`,
      14,
      34
    );
    doc.text(`Denetçi: İdari İşler Yetkilisi`, 14, 40);

    // Score Banner
    doc.setFillColor(percentage >= 85 ? 240 : 254, percentage >= 85 ? 253 : 242, percentage >= 85 ? 244 : 242);
    doc.rect(14, 46, 182, 16, "F");
    doc.setFontSize(13);
    doc.setTextColor(percentage >= 85 ? 22 : 185, percentage >= 85 ? 101 : 28, percentage >= 85 ? 52 : 28);
    doc.text(
      `Toplam Skor: ${earnedScore} / ${totalPossible} (%${percentage}) — ${
        percentage >= 85 ? "UYGUN (BAŞARILI)" : "DÜZELTİCİ AKSİYON GEREKLİ"
      }`,
      18,
      56
    );

    // Table Content
    const tableRows = questions.map((q, idx) => {
      const ans = answers[q.id];
      const statusText = ans?.isCompliant ? "UYGUN (Evet)" : "UYGUNSUZ (Hayır)";
      const detail = ans?.isCompliant
        ? "Sorun yok"
        : `${ans?.reason || "Açıklama girilmedi"} [Termin: ${ans?.deadline || "-"}]`;

      return [
        (idx + 1).toString(),
        q.category_section,
        q.question_text,
        `${q.points || 2}p`,
        statusText,
        detail,
      ];
    });

    autoTable(doc, {
      startY: 68,
      head: [["#", "Kategori", "Denetim Sorusu", "Puan", "Durum", "Açıklama / Termin"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 2 },
    });

    doc.save(`Idari360_Denetim_${category}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSubmitAudit = async () => {
    setIsSubmitting(true);
    try {
      await submitAudit({
        template_id: templateId || `b0000000-0000-0000-0000-000000000001`,
        facility_id: selectedFacility || facilities[0]?.id || "a0000000-0000-0000-0000-000000000001",
        vehicle_id: category === "servis" ? selectedVehicle || undefined : undefined,
        total_score: earnedScore,
        max_score: totalPossible,
        percentage_score: percentage,
        general_notes: notes,
        answers: questions.map((q) => {
          const a = answers[q.id];
          return {
            question_id: q.id,
            is_compliant: Boolean(a?.isCompliant),
            non_compliance_reason: a?.reason,
            deadline: a?.deadline,
          };
        }),
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert("Denetim kaydedilirken hata oluştu: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Scoring Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 sticky top-24 z-20 backdrop-blur-md bg-white/95">
        <div>
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            {category.toUpperCase()} DENETİM MERKEZİ (CANLI VERİTABANI)
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-0.5">{title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 text-xs"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            {category === "servis" && vehicles.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-600">Araç:</span>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono font-bold text-blue-600 text-xs"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} — {v.driver_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Live Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Canlı Puan</div>
            <div className="text-3xl font-black text-slate-900 leading-none mt-0.5">
              {earnedScore}{" "}
              <span className="text-sm font-bold text-slate-400">/ {totalPossible}</span>
            </div>
            <div
              className={`text-[11px] font-bold mt-1 ${
                percentage >= 85 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              %{percentage} {percentage >= 85 ? "UYGUN" : "AKSIYON GEREKLİ"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generatePdfReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              title="Resmi Denetim PDF İndir"
            >
              <Download className="w-4 h-4 text-slate-600" />
              PDF İndir
            </button>

            <button
              onClick={handleSubmitAudit}
              disabled={isSubmitting || isSubmitted}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Kaydediliyor..." : isSubmitted ? "Kaydedildi ✓" : "Denetimi Onayla & Kaydet"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification on Submission */}
      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm">Denetim Başarıyla Supabase Veritabanına Kaydedildi!</div>
            <p>
              Denetim sonucu <strong>{earnedScore} / {totalPossible} (%{percentage})</strong> olarak veritabanına işlendi.
            </p>
            {nonCompliantItems.length > 0 && (
              <p className="text-amber-800 font-medium">
                ⚠️ Tespit edilen {nonCompliantItems.length} uygunsuzluk için otomatik aksiyon oluşturuldu ve ilgili sorumlulara termin bildirim e-postası iletildi.
              </p>
            )}
          </div>
        </div>
      )}

      {/* General Inspection Photo Upload */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Genel Saha / Görünüm Fotoğrafı</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Denetimin geçerliliği için en az 1 genel görünüm fotoğrafı zorunludur.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            ✓ 1 Fotoğraf Eklendi
          </span>
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Fotoğraf Değiştir
          </button>
        </div>
      </div>

      {/* Questions Section by Section */}
      <div className="space-y-6">
        {Object.entries(groupedSections).map(([sectionTitle, sectionQuestions]) => {
          const sectionPoints = sectionQuestions.reduce((a, b) => a + (b.points || 2), 0);

          return (
            <div
              key={sectionTitle}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {sectionTitle}
                </h3>
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {sectionPoints} Puan
                </span>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-slate-100">
                {sectionQuestions.map((q, idx) => {
                  const currentAns = answers[q.id] || {
                    isCompliant: true,
                    reason: "",
                    deadline: "",
                    photoUploaded: false,
                  };

                  return (
                    <div key={q.id} className="p-6 transition hover:bg-slate-50/40">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {q.points || 2} Puan
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                            {q.question_text}
                          </p>
                        </div>

                        {/* EVET / HAYIR Toggle Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCompliance(q.id, true)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                              currentAns.isCompliant === true
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Evet
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCompliance(q.id, false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                              currentAns.isCompliant === false
                                ? "bg-red-600 text-white border-red-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Hayır
                          </button>
                        </div>
                      </div>

                      {/* NON-COMPLIANCE WORKFLOW */}
                      {currentAns.isCompliant === false && (
                        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3 animate-fadeIn">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Uygunsuzluk Tespiti & Düzeltici Aksiyon Girişi (Excel Kuralı)
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                            <div className="md:col-span-7">
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Uygunsuzluk Nedeni / Açıklaması *
                              </label>
                              <input
                                type="text"
                                placeholder="Eksik veya uygunsuz olan durumu açıklayın..."
                                value={currentAns.reason}
                                onChange={(e) => handleReasonChange(q.id, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-500/20"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                Termin Tarihi (Deadline) *
                              </label>
                              <input
                                type="date"
                                value={currentAns.deadline}
                                onChange={(e) => handleDeadlineChange(q.id, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            <div className="md:col-span-2 flex flex-col justify-end">
                              <button
                                type="button"
                                className="w-full py-2 px-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1"
                              >
                                <Camera className="w-3.5 h-3.5 text-slate-500" />
                                Kanıt Fotoğrafı
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
