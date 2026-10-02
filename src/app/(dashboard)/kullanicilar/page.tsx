"use client";

import { useState, useEffect } from "react";
import {
  Users, CheckCircle2, XCircle, Clock, Shield,
  Loader2, RefreshCw, UserCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "facility_admin", label: "Yönetici", desc: "Tam yetki" },
  { value: "facility_specialist", label: "Uzman", desc: "Tesis + Rapor" },
  { value: "facility_supervisor", label: "Sorumlu", desc: "Sadece işlemler" },
];

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  requested_role: string;
  approval_status: string;
  created_at: string;
}

export default function KullanicilarPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [assignRoles, setAssignRoles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const supabase = createClient();

  async function fetchUsers() {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("id, email, full_name, requested_role, approval_status, created_at")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("approval_status", filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setUsers(data as PendingUser[]);
      // Her kullanıcı için varsayılan rolü requested_role olarak ayarla
      const defaults: Record<string, string> = {};
      data.forEach((u: PendingUser) => {
        defaults[u.id] = u.requested_role || "facility_supervisor";
      });
      setAssignRoles(defaults);
    }
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, [filter]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleApprove(userId: string) {
    setProcessingId(userId);
    const role = assignRoles[userId] || "facility_supervisor";

    const { data, error } = await supabase.rpc("approve_user", {
      target_user_id: userId,
      assigned_role: role,
    });

    if (error) {
      showToast("Hata: " + error.message, "error");
    } else {
      showToast("Kullanıcı onaylandı ve rol atandı!", "success");
      fetchUsers();
    }
    setProcessingId(null);
  }

  async function handleReject(userId: string) {
    setProcessingId(userId);
    const reason = window.prompt("Ret gerekçesi (isteğe bağlı):");

    const { error } = await supabase.rpc("reject_user", {
      target_user_id: userId,
      reason: reason || null,
    });

    if (error) {
      showToast("Hata: " + error.message, "error");
    } else {
      showToast("Kullanıcı reddedildi.", "success");
      fetchUsers();
    }
    setProcessingId(null);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    approved: "Onaylı",
    rejected: "Reddedildi",
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Yeni üyeleri onaylayın, rol atayın veya erişimi reddedin.
          </p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}>
            {f === "pending" ? "Bekleyenler" : f === "approved" ? "Onaylılar" : f === "rejected" ? "Reddedilenler" : "Tümü"}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* User List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Bu kategoride kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Avatar & Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                  {user.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{user.full_name || "—"}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Talep edilen rol: <span className="font-semibold text-slate-600">
                      {ROLES.find(r => r.value === user.requested_role)?.label || user.requested_role}
                    </span>
                    &nbsp;•&nbsp;
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[user.approval_status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {statusLabels[user.approval_status] || user.approval_status}
              </div>

              {/* Actions - sadece pending kullanıcılar için */}
              {user.approval_status === "pending" && (
                <div className="flex items-center gap-2">
                  {/* Rol Seçici */}
                  <select
                    value={assignRoles[user.id] || "facility_supervisor"}
                    onChange={(e) => setAssignRoles(prev => ({ ...prev, [user.id]: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                    ))}
                  </select>

                  {/* Onayla */}
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {processingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Onayla
                  </button>

                  {/* Reddet */}
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processingId === user.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Security Info Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex gap-4 items-start">
        <div className="bg-blue-100 p-2 rounded-xl shrink-0">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-xs text-slate-600">
          <p className="font-bold text-slate-800 mb-1">Güvenlik Notu</p>
          <p>Onaylanmamış kullanıcılar panele giriş yapamaz ve hiçbir veriye erişemez. Bu engel hem uygulama katmanında hem de veritabanı RLS politikaları düzeyinde uygulanmaktadır.</p>
        </div>
      </div>
    </div>
  );
}
