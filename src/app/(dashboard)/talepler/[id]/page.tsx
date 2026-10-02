"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle,
  Building2, Calendar, Tag, User, FileText, Loader2,
  ChevronRight, Edit3, Send,
} from "lucide-react";
import {
  getOperationById, updateOperationStatus, approveOperation,
  rejectOperation, ALLOWED_TRANSITIONS,
} from "@/lib/services/operations-service";
import { Operation, OperationStatus, UserRole } from "@/lib/supabase/types";
import Link from "next/link";

const STATUS_STYLES: Record<OperationStatus, { bg: string; text: string; dot: string; label: string }> = {
  yeni:         { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    label: "Yeni" },
  devam_ediyor: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Devam Ediyor" },
  beklemede:    { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400",   label: "Beklemede" },
  onayda:       { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-500",  label: "Onayda" },
  tamamlandi:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Tamamlandı" },
};

const WORKFLOW_STEPS: OperationStatus[] = ["yeni", "devam_ediyor", "beklemede", "onayda", "tamamlandi"];

export default function TalepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Demo: gerçek uygulamada Supabase auth'tan
  const [userRole] = useState<UserRole>("facility_admin");

  const [op, setOp] = useState<Operation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOperationById(id).then((data) => {
      setOp(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Talep yükleniyor...</span>
      </div>
    );
  }

  if (!op) {
    return (
      <div className="text-center py-20 text-slate-500">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Talep bulunamadı.</p>
        <Link href="/talepler" className="text-blue-600 text-sm mt-2 inline-block">← Taleplere Dön</Link>
      </div>
    );
  }

  const st = STATUS_STYLES[op.status];
  const allowedNext = ALLOWED_TRANSITIONS[userRole]?.[op.status] || [];
  const currentStepIdx = WORKFLOW_STEPS.indexOf(op.status);

  const handleStatusChange = async (newStatus: OperationStatus) => {
    setActing(true);
    const ok = await updateOperationStatus(op.id, newStatus, userRole, op.status);
    if (ok) setOp({ ...op, status: newStatus });
    setActing(false);
  };

  const handleApprove = async () => {
    setActing(true);
    const ok = await approveOperation(op.id);
    if (ok) setOp({ ...op, status: "tamamlandi", completed_at: new Date().toISOString() });
    setActing(false);
  };

  const handleReject = async () => {
    setActing(true);
    const ok = await rejectOperation(op.id, rejectReason);
    if (ok) {
      setOp({ ...op, status: "devam_ediyor" });
      setShowRejectForm(false);
    }
    setActing(false);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const deadlineDiff = op.deadline
    ? Math.ceil((new Date(op.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Geri */}
      <Link
        href="/talepler"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Talep Listesine Dön
      </Link>

      {/* Başlık Kartı */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                {op.operation_number}
              </span>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </div>
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{op.title}</h1>
            {op.description && (
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{op.description}</p>
            )}
          </div>

          {/* Aksiyon butonları */}
          <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
            {userRole === "facility_admin" && op.status === "onayda" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={acting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Onayla & Kapat
                </button>
                <button
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  disabled={acting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition border border-red-200"
                >
                  <XCircle className="w-4 h-4" />
                  Reddet
                </button>
              </>
            )}

            {allowedNext.length > 0 && op.status !== "onayda" && op.status !== "tamamlandi" && (
              <div>
                <p className="text-[11px] text-slate-400 mb-1 font-medium">Durumu Güncelle:</p>
                <div className="flex flex-col gap-1.5">
                  {allowedNext.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={acting}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition text-left disabled:opacity-60"
                    >
                      → {STATUS_STYLES[s].label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reddet formu */}
        {showRejectForm && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-2">Reddetme Nedeni (isteğe bağlı)</p>
            <textarea
              rows={2}
              placeholder="Neden reddedildi?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-xs resize-none focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReject}
                disabled={acting}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold disabled:opacity-60"
              >
                Gönder
              </button>
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* İş Akışı Zaman Çizelgesi */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-5">İş Akışı Durumu</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = step === op.status;
            const isDone = idx < currentStepIdx;
            const isFuture = idx > currentStepIdx;
            const s = STATUS_STYLES[step];
            return (
              <div key={step} className="flex items-center shrink-0">
                <div className={`flex flex-col items-center gap-1.5`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isActive ? `${s.bg} ${s.text} ring-2 ring-offset-2 ${s.dot.replace("bg-", "ring-")}` :
                    isDone ? "bg-emerald-500 text-white" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive ? s.text : isFuture ? "text-slate-300" : "text-slate-500"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div className={`h-0.5 w-10 mx-1 rounded ${isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detay Bilgiler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Talep Bilgileri</h2>
          <dl className="space-y-3 text-xs">
            {[
              { label: "Tesis", value: (op.facility as any)?.name || "—", icon: <Building2 className="w-3.5 h-3.5" /> },
              { label: "Kategori", value: op.category.charAt(0).toUpperCase() + op.category.slice(1), icon: <Tag className="w-3.5 h-3.5" /> },
              { label: "Öncelik", value: op.priority.toUpperCase(), icon: <AlertTriangle className="w-3.5 h-3.5" /> },
              { label: "Oluşturulma", value: formatDate(op.created_at), icon: <Calendar className="w-3.5 h-3.5" /> },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">{item.icon}</span>
                <div>
                  <dt className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</dt>
                  <dd className="text-slate-900 font-semibold mt-0.5">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Termin & Tamamlanma</h2>
          <dl className="space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
              <div>
                <dt className="text-[10px] text-slate-400 uppercase tracking-wide">Termin Tarihi</dt>
                <dd className={`font-semibold mt-0.5 ${
                  deadlineDiff !== null && deadlineDiff < 0 ? "text-red-600" :
                  deadlineDiff !== null && deadlineDiff <= 3 ? "text-amber-600" : "text-slate-900"
                }`}>
                  {formatDate(op.deadline)}
                  {deadlineDiff !== null && deadlineDiff >= 0 && (
                    <span className="ml-1 text-[10px] text-slate-400">({deadlineDiff} gün kaldı)</span>
                  )}
                  {deadlineDiff !== null && deadlineDiff < 0 && (
                    <span className="ml-1 text-[10px] text-red-500">({Math.abs(deadlineDiff)} gün geçti)</span>
                  )}
                </dd>
              </div>
            </div>
            {op.completed_at && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                <div>
                  <dt className="text-[10px] text-slate-400 uppercase tracking-wide">Tamamlanma Tarihi</dt>
                  <dd className="text-emerald-700 font-semibold mt-0.5">{formatDate(op.completed_at)}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
