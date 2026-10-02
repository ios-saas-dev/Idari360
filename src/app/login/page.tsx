"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { UserRole } from "@/lib/supabase/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mehmet.yilmaz@idari360.com");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<UserRole>("facility_admin");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Set role cookie for middleware & state
    document.cookie = `idari360_user_role=${selectedRole}; path=/; max-age=86400`;

    setTimeout(() => {
      setLoading(false);
      if (selectedRole === "staff") {
        router.push("/yetkisiz-erisim");
      } else {
        router.push("/");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              İdari<span className="text-blue-600">360</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">İdari İşler Yönetim Süreç Platformu</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              E-posta veya Kullanıcı Adı
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Quick Role Tester / Switcher for Pair-Programming & Demo */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Sisteme Giriş Yapılacak Rol:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRole("facility_admin")}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  selectedRole === "facility_admin"
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedRole === "facility_admin" ? "text-blue-600" : "text-transparent"}`} />
                <div>
                  <div>Yönetici</div>
                  <div className="text-[10px] text-slate-400 font-normal">Tüm yetkiler</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("facility_specialist")}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  selectedRole === "facility_specialist"
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedRole === "facility_specialist" ? "text-blue-600" : "text-transparent"}`} />
                <div>
                  <div>Uzman</div>
                  <div className="text-[10px] text-slate-400 font-normal">Kendi tesisi + Rapor</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("facility_supervisor")}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  selectedRole === "facility_supervisor"
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedRole === "facility_supervisor" ? "text-blue-600" : "text-transparent"}`} />
                <div>
                  <div>Sorumlu</div>
                  <div className="text-[10px] text-slate-400 font-normal">Kendi tesisi (Rapor yok)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("staff")}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  selectedRole === "staff"
                    ? "bg-red-50 border-red-500 text-red-900 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedRole === "staff" ? "text-red-600" : "text-transparent"}`} />
                <div>
                  <div>Personel</div>
                  <div className="text-[10px] text-red-500 font-normal">Web engellenir!</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Beni Hatırla
            </label>
            <a href="#" className="text-blue-600 hover:underline font-medium">Şifremi Unuttum?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            İdari 360 v1.0 • Supabase Auth & RLS Güvenlik Altyapısı
          </p>
        </div>
      </div>
    </div>
  );
}
