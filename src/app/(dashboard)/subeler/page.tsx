"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  AlertCircle,
  Droplets,
  Bug,
  Sparkles,
  Coins,
  Edit3,
  X,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  getFacilities,
  createFacility,
  updateFacilityScores,
} from "@/lib/services/facilities-service";
import { Facility } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

export default function SubelerPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Scorecard State
  const [editCleanliness, setEditCleanliness] = useState(90);
  const [editPest, setEditPest] = useState(95);
  const [editWaternet, setEditWaternet] = useState(88);
  const [editCost, setEditCost] = useState(48500);

  // New Facility Form State
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("İstanbul");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCost, setNewCost] = useState(50000);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFacilities();
      setFacilities(data);
      if (data.length > 0) {
        if (!selectedFacility) {
          setSelectedFacility(data[0]);
          setEditCleanliness(Number(data[0].cleanliness_score));
          setEditPest(Number(data[0].pest_control_score));
          setEditWaternet(Number(data[0].waternet_score));
          setEditCost(Number(data[0].monthly_cost));
        } else {
          const current = data.find((f) => f.id === selectedFacility.id);
          if (current) setSelectedFacility(current);
        }
      }
    } catch (err) {
      console.error("Subeler load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectFacility = (f: Facility) => {
    setSelectedFacility(f);
    setEditCleanliness(Number(f.cleanliness_score));
    setEditPest(Number(f.pest_control_score));
    setEditWaternet(Number(f.waternet_score));
    setEditCost(Number(f.monthly_cost));
  };

  const handleUpdateScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setIsSubmitting(true);
    try {
      const updated = await updateFacilityScores(selectedFacility.id, {
        cleanliness_score: editCleanliness,
        pest_control_score: editPest,
        waternet_score: editWaternet,
        monthly_cost: editCost,
      });

      setFacilities(
        facilities.map((f) => (f.id === selectedFacility.id ? { ...f, ...updated } : f))
      );
      setSelectedFacility({ ...selectedFacility, ...updated });
      setIsEditModalOpen(false);
    } catch {
      alert("Şube karne skorları güncellenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      alert("Lütfen şube kodu ve adını doldurunuz.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createFacility({
        code: newCode.toUpperCase().trim(),
        name: newName.trim(),
        city: newCity.trim(),
        address: newAddress.trim(),
        phone: newPhone.trim(),
        monthly_cost: Number(newCost),
        cleanliness_score: 90.0,
        pest_control_score: 95.0,
        waternet_score: 88.0,
      });

      setFacilities([...facilities, created]);
      setSelectedFacility(created);
      setIsNewModalOpen(false);
      setNewCode("");
      setNewName("");
      setNewAddress("");
      setNewPhone("");
    } catch (err: any) {
      alert("Yeni şube eklenirken bir hata oluştu: " + (err?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Şubeler — 360° Tesis Karnesi (Canlı Veritabanı)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Şubelerin temizlik, ilaçlama, Waternet su arıtma ve maliyet performansının canlı PostgreSQL takibi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Şube Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Facilities List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Kayıtlı Tesisler ({facilities.length})
            </span>
            <button
              onClick={loadData}
              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700"
              title="Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Şube veya il ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {loading && (
              <div className="p-4 text-xs text-slate-400 text-center">
                Şubeler yükleniyor...
              </div>
            )}
            {filteredFacilities.map((f) => {
              const isSelected = selectedFacility?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFacility(f)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{f.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        f.health_status === "good"
                          ? "bg-emerald-500"
                          : f.health_status === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>
                      {f.city} • {f.code}
                    </span>
                    <span className="font-semibold text-slate-700">
                      ★ {f.satisfaction_score} / 5
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredFacilities.length === 0 && !loading && (
              <div className="p-4 text-xs text-slate-400 text-center">
                Eşleşen şube bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Facility 360° Scorecard Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedFacility ? (
            <>
              {/* Facility Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] font-mono">
                      {selectedFacility.code}
                    </span>
                    <h2 className="text-xl font-black text-slate-900">
                      {selectedFacility.name}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedFacility.address || `${selectedFacility.city}, Türkiye`}
                    </span>
                    {selectedFacility.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedFacility.phone}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Karnesi Güncelle
                </button>
              </div>

              {/* 4 Pillars of Facility 360 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Temizlik */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold">Temizlik Skoru</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      %{selectedFacility.cleanliness_score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedFacility.cleanliness_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
                    <span>Diversey Standartları</span>
                    <span className="text-emerald-600 font-semibold">Hedef: %90+</span>
                  </div>
                </div>

                {/* 2. İlaçlama */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Bug className="w-4 h-4" />
                      <span className="text-xs font-bold">İlaçlama & Haşere</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      %{selectedFacility.pest_control_score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedFacility.pest_control_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
                    <span>Aylık Periyodik Uygulama</span>
                    <span className="text-emerald-600 font-semibold">Hedef: %95+</span>
                  </div>
                </div>

                {/* 3. Waternet */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-bold">Waternet Su Arıtma</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      %{selectedFacility.waternet_score}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedFacility.waternet_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
                    <span>TDS & Filtre Durumu</span>
                    <span className="text-cyan-700 font-semibold">TDS Değeri: 28 ppm</span>
                  </div>
                </div>

                {/* 4. Maliyet */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Coins className="w-4 h-4" />
                      <span className="text-xs font-bold">Aylık İdari Maliyet</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {formatCurrency(Number(selectedFacility.monthly_cost))}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[78%]" />
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[11px] text-slate-500">
                    <span>Bütçe Gerçekleşme</span>
                    <span className="text-emerald-600 font-semibold">Bütçe İçi (%78)</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs">
              Lütfen sol taraftan bir tesis seçin.
            </div>
          )}
        </div>
      </div>

      {/* Edit Scorecard Modal */}
      {isEditModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {selectedFacility.name} — Karne Güncelle
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateScores} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temizlik Skoru (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editCleanliness}
                  onChange={(e) => setEditCleanliness(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  İlaçlama Skoru (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editPest}
                  onChange={(e) => setEditPest(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Waternet Su Arıtma Skoru (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editWaternet}
                  onChange={(e) => setEditWaternet(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aylık İdari Maliyet (₺)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editCost}
                  onChange={(e) => setEditCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Canlı Veritabanına Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Facility Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Yeni Tesis / Şube Kaydı
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Şube Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SUB-006"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bursa"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Şube / Tesis Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nilüfer Lojistik & Tesisleri"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adres
                </label>
                <input
                  type="text"
                  placeholder="Organize Sanayi Bölgesi 1. Cadde"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    placeholder="0224 000 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aylık Tahmini Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Şubeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
