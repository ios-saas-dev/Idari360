"use client";

import { useState, useEffect } from "react";
import { Package, QrCode, Search, Plus, UserCheck, Wrench, AlertOctagon, X, CheckCircle2, RefreshCw } from "lucide-react";
import { getAssets, createAsset, AssetRecord } from "@/lib/services/assets-service";
import { getFacilities } from "@/lib/services/facilities-service";
import { Facility } from "@/lib/supabase/types";

export default function VarliklarPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQrModal, setShowQrModal] = useState<AssetRecord | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New asset form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Temizlik Ekipmanı");
  const [newFacility, setNewFacility] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [astData, facData] = await Promise.all([
        getAssets(),
        getFacilities(),
      ]);
      setAssets(astData);
      setFacilities(facData);
      if (facData.length > 0 && !newFacility) {
        setNewFacility(facData[0].id);
      }
    } catch (err) {
      console.error("Varliklar load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newFacility) {
      alert("Lütfen demirbaş adını ve şubeyi seçiniz.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAsset({
        facility_id: newFacility,
        name: newName.trim(),
        category: newCategory,
        assigned_to: newAssignedTo.trim(),
        status: "aktif",
      });

      setAssets([created, ...assets]);
      setIsNewModalOpen(false);
      setNewName("");
      setNewAssignedTo("");
    } catch (err: any) {
      alert("Demirbaş kaydı sırasında bir hata oluştu: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = assets.filter(
    (ast) =>
      ast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ast.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Varlık & Demirbaş Yönetimi (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Demirbaş takibi, personel zimmeti, bakım ve QR barkod ile anında varlık geçmişi sorgulama.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Demirbaş Kaydet
        </button>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Barkod veya demirbaş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">
              {loading ? "Yükleniyor..." : `Toplam ${filtered.length} Kayıtlı Demirbaş`}
            </span>
            <button
              onClick={loadData}
              className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Barkod / QR</th>
                <th className="py-3 px-4">Demirbaş Adı</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Bulunduğu Tesis</th>
                <th className="py-3 px-4">Zimmetli Kişi</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">QR & Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {ast.barcode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ast.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{ast.category}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {ast.facilities?.name || "Agora Şubesi"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {ast.assigned_to || "Ortak Kullanım"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                        ast.status === "aktif"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : ast.status === "bakimda"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {ast.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setShowQrModal(ast)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-600" />
                      QR Gör
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Kayıtlı demirbaş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-center">
            <button
              onClick={() => setShowQrModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {showQrModal.name}
            </h3>
            <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">
              {showQrModal.barcode}
            </p>

            {/* Generated QR Code Canvas Mock */}
            <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              {/* SVG QR Code Simulation */}
              <svg className="w-40 h-40 mx-auto" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <path
                  d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z"
                  fill="#0f172a"
                />
                <path
                  d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z"
                  fill="#0f172a"
                />
                <path
                  d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z"
                  fill="#0f172a"
                />
                <rect x="45" y="10" width="8" height="25" fill="#0f172a" />
                <rect x="10" y="45" width="25" height="8" fill="#0f172a" />
                <rect x="45" y="45" width="10" height="10" fill="#2563eb" />
                <rect x="60" y="50" width="30" height="8" fill="#0f172a" />
                <rect x="50" y="65" width="15" height="25" fill="#0f172a" />
                <rect x="70" y="65" width="20" height="10" fill="#0f172a" />
                <rect x="75" y="80" width="15" height="10" fill="#0f172a" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Bu QR kod mobil cihaz ile okutulduğunda varlık bakım geçmişi ve zimmet detayları listelenir.
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="mt-5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* New Asset Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Yeni Demirbaş Kaydı (PostgreSQL)
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Demirbaş / Varlık Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Taski Binicili Zemin Yıkama Makinesi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Temizlik Ekipmanı">Temizlik Ekipmanı</option>
                    <option value="Yemekhane">Yemekhane</option>
                    <option value="Lojistik & Depo">Lojistik & Depo</option>
                    <option value="Hijyen">Hijyen</option>
                    <option value="Bilişim & Ofis">Bilişim & Ofis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bulunduğu Şube
                  </label>
                  <select
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Zimmetli Kişi / Departman
                </label>
                <input
                  type="text"
                  placeholder="Örn: Temizlik Ekip Lideri / Ahmet Yılmaz"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Veritabanına Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
