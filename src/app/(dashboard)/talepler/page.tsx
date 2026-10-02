"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { operationsList, facilitiesList } from "@/lib/mock-data";
import { Operation, OperationCategory, OperationPriority } from "@/lib/supabase/types";
import { getCategoryBadgeColor } from "@/lib/utils";

export default function TaleplerPage() {
  const [operations, setOperations] = useState<Operation[]>(operationsList);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Demand Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<OperationCategory>("yemekhane");
  const [newFacility, setNewFacility] = useState(facilitiesList[0].id);
  const [newPriority, setNewPriority] = useState<OperationPriority>("orta");
  const [newDescription, setNewDescription] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Operation = {
      id: `op-${Date.now()}`,
      facility_id: newFacility,
      operation_number: `TAL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      category: newCategory,
      description: newDescription,
      priority: newPriority,
      status: "yeni",
      deadline: newDeadline,
      created_at: new Date().toISOString(),
    };

    setOperations([created, ...operations]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    setOperations(
      operations.map((op) => (op.id === id ? { ...op, status: newStatus } : op))
    );
  };

  const filtered = operations.filter((op) => {
    const matchesFilter = filterStatus === "all" || op.status === filterStatus;
    const matchesSearch =
      op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.operation_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Talep & Onay Süreçleri
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Şubelerden gelen idari talepler, onay hiyerarşisi ve iş akış takibi.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Yeni Talep Oluştur
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Talep no veya başlık ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { id: "all", label: "Tümü" },
            { id: "yeni", label: "Yeni (12)" },
            { id: "devam_ediyor", label: "Devam Ediyor (8)" },
            { id: "onayda", label: "Onayda (3)" },
            { id: "tamamlandi", label: "Tamamlandı" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Talep No</th>
                <th className="py-3.5 px-5">Başlık & Şube</th>
                <th className="py-3.5 px-5">Kategori</th>
                <th className="py-3.5 px-5">Öncelik</th>
                <th className="py-3.5 px-5">Durum / İş Akışı</th>
                <th className="py-3.5 px-5">Termin</th>
                <th className="py-3.5 px-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-5 font-mono font-bold text-blue-600">
                    {op.operation_number}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">{op.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {op.description || "Açıklama belirtilmemiş"}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCategoryBadgeColor(
                        op.category
                      )}`}
                    >
                      {op.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        op.priority === "acil"
                          ? "bg-red-100 text-red-700"
                          : op.priority === "yuksek"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {op.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <select
                        value={op.status}
                        onChange={(e) => handleStatusChange(op.id, e.target.value)}
                        className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-none ${
                          op.status === "yeni"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : op.status === "devam_ediyor"
                            ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                            : op.status === "onayda"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        <option value="yeni">Yeni</option>
                        <option value="onayda">Onayda</option>
                        <option value="devam_ediyor">Devam Ediyor</option>
                        <option value="tamamlandi">Tamamlandı</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500 font-medium">
                    {op.deadline || "Belirtilmedi"}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleStatusChange(op.id, "tamamlandi")}
                      className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                      title="Onayla & Kapat"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Demand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Yeni İdari Talep Oluştur
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Talep Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Agora Yemekhane İlave Saladbar Temini"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as OperationCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="yemekhane">Yemekhane</option>
                    <option value="servis">Servis</option>
                    <option value="filo">Filo</option>
                    <option value="temizlik">Temizlik</option>
                    <option value="varlik">Varlık</option>
                    <option value="guvenlik">Güvenlik</option>
                    <option value="teknik">Teknik</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Şube / Tesis
                  </label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {facilitiesList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as OperationPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="orta">Orta</option>
                    <option value="yuksek">Yüksek</option>
                    <option value="acil">Acil ⚠️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Termin Tarihi
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Açıklama & Detaylar
                </label>
                <textarea
                  rows={3}
                  placeholder="İhtiyacı ve gerekçeyi detaylandırın..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25"
                >
                  Talebi Kaydet & Onaya Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
