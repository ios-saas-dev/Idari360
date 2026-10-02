"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, Filter, CheckCircle2, XCircle, Clock,
  AlertTriangle, ChevronRight, Building2, Tag, Calendar,
  User, RefreshCw, Inbox, Zap, ArrowUpRight, Bell,
} from "lucide-react";
import {
  getOperations, createOperation, updateOperationStatus,
  approveOperation, rejectOperation, getOperationStats,
  ALLOWED_TRANSITIONS, CreateOperationInput,
} from "@/lib/services/operations-service";
import { getFacilities } from "@/lib/services/facilities-service";
import {
  Operation, OperationCategory, OperationPriority, OperationStatus,
  UserRole, Facility,
} from "@/lib/supabase/types";
import Link from "next/link";

// ─────────────────────────────────────────────────────
// Sabit etiket renkleri
// ─────────────────────────────────────────────────────
const STATUS_STYLES: Record<OperationStatus, { bg: string; text: string; dot: string; label: string }> = {
  yeni:         { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    label: "Yeni" },
  devam_ediyor: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Devam Ediyor" },
  beklemede:    { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400",   label: "Beklemede" },
  onayda:       { bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-500",  label: "Onayda" },
  tamamlandi:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Tamamlandı" },
};

const PRIORITY_STYLES: Record<OperationPriority, { bg: string; text: string; label: string }> = {
  dusuk:  { bg: "bg-slate-100", text: "text-slate-600", label: "Düşük" },
  orta:   { bg: "bg-sky-100",   text: "text-sky-700",   label: "Orta" },
  yuksek: { bg: "bg-amber-100", text: "text-amber-700", label: "Yüksek" },
  acil:   { bg: "bg-red-100",   text: "text-red-700",   label: "⚠️ ACİL" },
};

const CATEGORY_META: Record<OperationCategory, { label: string; icon: string; color: string }> = {
  yemekhane: { label: "Yemekhane",  icon: "🍽️",  color: "text-orange-600 bg-orange-50 border-orange-200" },
  servis:    { label: "Servis",     icon: "🚌",  color: "text-blue-600 bg-blue-50 border-blue-200" },
  filo:      { label: "Filo",       icon: "🚗",  color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  temizlik:  { label: "Temizlik",   icon: "🧹",  color: "text-teal-600 bg-teal-50 border-teal-200" },
  varlik:    { label: "Varlık",     icon: "📦",  color: "text-purple-600 bg-purple-50 border-purple-200" },
  guvenlik:  { label: "Güvenlik",   icon: "🔒",  color: "text-red-600 bg-red-50 border-red-200" },
  teknik:    { label: "Teknik",     icon: "🔧",  color: "text-slate-700 bg-slate-50 border-slate-200" },
  diger:     { label: "Diğer",      icon: "📋",  color: "text-gray-600 bg-gray-50 border-gray-200" },
};

// ─────────────────────────────────────────────────────
// Ana Sayfa
// ─────────────────────────────────────────────────────
export default function TaleplerPage() {
  // Demo: gerçek uygulamada Supabase auth'tan çekilir
  const [userRole] = useState<UserRole>("facility_admin");

  const [operations, setOperations] = useState<Operation[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState({ yeni: 0, devam_ediyor: 0, onayda: 0, tamamlandi: 0, beklemede: 0, acil: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtreler
  const [filterStatus, setFilterStatus] = useState<OperationStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<OperationCategory | "all">("all");
  const [filterFacility, setFilterFacility] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Yeni talep formu
  const [form, setForm] = useState<CreateOperationInput>({
    facility_id: "",
    title: "",
    category: "yemekhane",
    description: "",
    priority: "orta",
    deadline: "",
  });

  // ── Veri yükleme ──────────────────────────────────
  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    const [ops, facs, st] = await Promise.all([
      getOperations({
        status: filterStatus !== "all" ? filterStatus : undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        facilityId: filterFacility !== "all" ? filterFacility : undefined,
        search: searchTerm || undefined,
      }),
      getFacilities(),
      getOperationStats(),
    ]);

    setOperations(ops);
    setFacilities(facs);
    setStats(st);
    if (facs.length > 0 && !form.facility_id) {
      setForm((f) => ({ ...f, facility_id: facs[0].id }));
    }
    setLoading(false);
    setRefreshing(false);
  }, [filterStatus, filterCategory, filterFacility, searchTerm, form.facility_id]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Supabase Realtime aboneliği ───────────────────
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("operations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "operations" }, () => {
        loadData(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // ── İşlemler ──────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createOperation(form);
      setOperations((prev) => [created, ...prev]);
      setStats((s) => ({ ...s, yeni: s.yeni + 1 }));
      setIsModalOpen(false);
      setForm((f) => ({ ...f, title: "", description: "", deadline: "" }));
    } catch (err: any) {
      alert(err.message || "Talep oluşturulurken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (op: Operation, newStatus: OperationStatus) => {
    const allowed = ALLOWED_TRANSITIONS[userRole]?.[op.status] || [];
    if (!allowed.includes(newStatus)) return;
    setOperations((prev) => prev.map((o) => o.id === op.id ? { ...o, status: newStatus } : o));
    await updateOperationStatus(op.id, newStatus, userRole, op.status);
    await getOperationStats().then(setStats);
  };

  const handleApprove = async (op: Operation) => {
    if (userRole !== "facility_admin") return;
    setOperations((prev) => prev.map((o) => o.id === op.id ? { ...o, status: "tamamlandi" } : o));
    await approveOperation(op.id);
    await getOperationStats().then(setStats);
  };

  const openReject = (id: string) => {
    setRejectTargetId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTargetId) return;
    setOperations((prev) =>
      prev.map((o) => o.id === rejectTargetId ? { ...o, status: "devam_ediyor" } : o)
    );
    await rejectOperation(rejectTargetId, rejectReason);
    await getOperationStats().then(setStats);
    setIsRejectModalOpen(false);
  };

  // ── Deadline rengi ──────────────────────────────────
  const deadlineColor = (deadline?: string) => {
    if (!deadline) return "text-slate-400";
    const diff = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-red-600 font-bold";
    if (diff <= 3) return "text-amber-600 font-semibold";
    return "text-slate-500";
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  };

  // ── Render ──────────────────────────────────────────
  const canCreate = userRole === "facility_admin" || userRole === "facility_specialist" || userRole === "facility_supervisor";

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto">
      {/* ── Başlık ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Talep & Onay Süreçleri</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kategori bazlı iş akışları · Rol yetkisine göre onay · Termin bildirimleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Yeni Talep Oluştur
            </button>
          )}
        </div>
      </div>

      {/* ── İstatistik Kartları ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "yeni",         label: "Yeni",          val: stats.yeni,         color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
          { key: "devam_ediyor", label: "Devam Ediyor",  val: stats.devam_ediyor, color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
          { key: "beklemede",    label: "Beklemede",     val: stats.beklemede,    color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
          { key: "onayda",       label: "Onayda",        val: stats.onayda,       color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-100" },
          { key: "tamamlandi",   label: "Tamamlandı",    val: stats.tamamlandi,   color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { key: "acil",         label: "ACİL Öncelikli",val: stats.acil,         color: "text-red-600",     bg: "bg-red-50",     border: "border-red-100" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key === "acil" ? "all" : s.key as OperationStatus | "all")}
            className={`${s.bg} ${s.border} border rounded-2xl p-3.5 text-left transition hover:opacity-80 ${
              filterStatus === s.key ? "ring-2 ring-offset-1 ring-blue-400" : ""
            }`}
          >
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* ── Filtre Çubuğu ───────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Arama */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Talep no veya başlık ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Kategori filtreleri */}
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterCategory === "all" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              Tüm Kategoriler
            </button>
            {(Object.keys(CATEGORY_META) as OperationCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  filterCategory === cat ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>

          {/* Tesis seçimi — admin için */}
          {userRole === "facility_admin" && (
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="ml-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs shrink-0"
            >
              <option value="all">Tüm Tesisler</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Operasyon Listesi ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Talepler yükleniyor...</span>
          </div>
        ) : operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Inbox className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">Talep bulunamadı</p>
            <p className="text-xs">Filtre kriterlerinizi değiştirin veya yeni talep oluşturun.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Talep No</th>
                  <th className="py-3.5 px-5">Başlık & Tesis</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5">Öncelik</th>
                  <th className="py-3.5 px-5">Durum</th>
                  <th className="py-3.5 px-5">Termin</th>
                  <th className="py-3.5 px-5 text-center">İş Akışı</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {operations.map((op) => {
                  const st = STATUS_STYLES[op.status];
                  const pr = PRIORITY_STYLES[op.priority];
                  const cat = CATEGORY_META[op.category];
                  const allowedNext = ALLOWED_TRANSITIONS[userRole]?.[op.status] || [];
                  return (
                    <tr key={op.id} className="hover:bg-slate-50/50 transition group">
                      <td className="py-4 px-5 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {op.operation_number}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 max-w-[240px] truncate">{op.title}</div>
                        {op.facility && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {(op.facility as any).name}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${cat.color}`}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pr.bg} ${pr.text}`}>
                          {pr.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </div>
                      </td>
                      <td className={`py-4 px-5 whitespace-nowrap font-medium ${deadlineColor(op.deadline)}`}>
                        {op.deadline ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 opacity-70" />
                            {formatDate(op.deadline)}
                          </div>
                        ) : "—"}
                      </td>

                      {/* İş Akışı Butonları — Rol Bazlı */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 justify-center flex-wrap">
                          {/* Durum Değiştirme select — izinli geçişler varsa */}
                          {allowedNext.length > 0 && op.status !== "onayda" && (
                            <select
                              value={op.status}
                              onChange={(e) => handleStatusChange(op, e.target.value as OperationStatus)}
                              className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                            >
                              <option value={op.status} disabled>{st.label}</option>
                              {allowedNext.map((s) => (
                                <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                              ))}
                            </select>
                          )}

                          {/* Admin: Onayda durumdakiler için Onayla / Reddet */}
                          {userRole === "facility_admin" && op.status === "onayda" && (
                            <>
                              <button
                                onClick={() => handleApprove(op)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition"
                                title="Onayla"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Onayla
                              </button>
                              <button
                                onClick={() => openReject(op.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[11px] font-bold transition"
                                title="Reddet"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reddet
                              </button>
                            </>
                          )}

                          {/* Tüm roller: tamamlandi ise ✓ işareti */}
                          {op.status === "tamamlandi" && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Kapandı
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Detay linki */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/talepler/${op.id}`}
                          className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 inline-flex"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Yeni Talep Modali ────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Yeni İdari Talep Oluştur</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Talep otomatik numara alarak sisteme kaydedilir.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Talep Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Agora Yemekhane İlave Saladbar Temini"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as OperationCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {(Object.keys(CATEGORY_META) as OperationCategory[]).map((c) => (
                      <option key={c} value={c}>{CATEGORY_META[c].icon} {CATEGORY_META[c].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Şube / Tesis *</label>
                  <select
                    required
                    value={form.facility_id}
                    onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Öncelik</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as OperationPriority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="orta">Orta</option>
                    <option value="yuksek">Yüksek</option>
                    <option value="acil">⚠️ Acil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Termin Tarihi</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama & Detaylar</label>
                <textarea
                  rows={3}
                  placeholder="İhtiyacı ve gerekçeyi detaylandırın..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 disabled:opacity-60"
                >
                  {submitting ? "Kaydediliyor..." : "Talebi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reddetme Nedeni Modali ───────────────────── */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">Talebi Reddet</h3>
            <p className="text-xs text-slate-500 mb-4">Reddetme nedeninizi belirtin. Talep "Devam Ediyor" statüsüne düşürülür.</p>
            <textarea
              rows={3}
              placeholder="Reddetme nedeni (isteğe bağlı)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
              >
                Reddet & Geri Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
