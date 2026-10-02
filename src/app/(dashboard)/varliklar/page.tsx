"use client";

import { useState } from "react";
import { Package, QrCode, Search, Plus, UserCheck, Wrench, AlertOctagon } from "lucide-react";

interface Asset {
  id: string;
  barcode: string;
  name: string;
  category: string;
  facility: string;
  assignedTo?: string;
  status: "aktif" | "bakimda" | "arizali" | "hurda";
  purchaseDate: string;
}

const mockAssets: Asset[] = [
  { id: "ast-1", barcode: "AST-2026-9901", name: "Taski Binicili Zemin Yıkama Makinesi", category: "Temizlik Ekipmanı", facility: "Agora Şubesi", assignedTo: "Temizlik Ekip Lideri", status: "aktif", purchaseDate: "2024-03-10" },
  { id: "ast-2", barcode: "AST-2026-9902", name: "Saladbar Soğutmalı Teşhir Ünitesi", category: "Yemekhane", facility: "Maslak Genel Merkez", assignedTo: "Catering Sorumlusu", status: "aktif", purchaseDate: "2023-08-15" },
  { id: "ast-3", barcode: "AST-2026-9903", name: "Jungheinrich Akülü Transpalet", category: "Lojistik & Depo", facility: "Kadıköy Lojistik", assignedTo: "Depo Şefi", status: "bakimda", purchaseDate: "2024-01-20" },
  { id: "ast-4", barcode: "AST-2026-9904", name: "Diversey Otomatik Dozajlama Ünitesi", category: "Hijyen", facility: "Bornova Depo", assignedTo: "İdari İşler Uzmanı", status: "aktif", purchaseDate: "2024-05-12" },
];

export default function VarliklarPage() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQrModal, setShowQrModal] = useState<Asset | null>(null);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Varlık & Demirbaş Yönetimi
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Demirbaş takibi, personel zimmeti, bakım ve QR barkod ile anında varlık geçmişi sorgulama.
          </p>
        </div>

        <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Demirbaş Kaydet
        </button>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
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
                <th className="py-3 px-4 text-right">QR & Geçmiş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {ast.barcode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ast.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{ast.category}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{ast.facility}</td>
                  <td className="py-3.5 px-4 text-slate-600">{ast.assignedTo || "Havuzda"}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ast.status === "aktif"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {ast.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setShowQrModal(ast)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                      title="QR Kod Göster"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-slate-100 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">{showQrModal.name}</h3>
            <p className="font-mono text-xs text-blue-600 mt-1">{showQrModal.barcode}</p>

            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {/* Simulated QR Code SVG */}
              <svg className="w-36 h-36" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                <rect x="45" y="20" width="10" height="10" fill="#0f172a" />
                <rect x="40" y="45" width="20" height="20" fill="#0f172a" />
                <rect x="70" y="65" width="15" height="15" fill="#0f172a" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-400">
              Mobil cihaz kamerasıyla okutulduğunda varlığın tam geçmişine ve zimmet durumuna anında ulaşılır.
            </p>

            <button
              onClick={() => setShowQrModal(null)}
              className="mt-6 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
