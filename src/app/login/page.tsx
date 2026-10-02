"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Lock, Mail, User, Briefcase, Loader2,
  CheckCircle2, AlertCircle, Clock, ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthStep = "form" | "verify_email" | "pending_approval" | "rejected";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>("form");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [requestedRole, setRequestedRole] = useState("facility_supervisor");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        // ─── GİRİŞ ───────────────────────────────────────────────
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);

        // E-posta doğrulandı mı?
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error("E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.");
        }

        // Profil ve onay durumunu kontrol et
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("role, approval_status, is_active")
          .eq("id", data.user.id)
          .single();

        if (profileErr || !profile) {
          await supabase.auth.signOut();
          throw new Error("Profil bulunamadı. Lütfen destek ile iletişime geçin.");
        }

        if (profile.approval_status === "pending") {
          await supabase.auth.signOut();
          setStep("pending_approval");
          setLoading(false);
          return;
        }

        if (profile.approval_status === "rejected") {
          await supabase.auth.signOut();
          setStep("rejected");
          setLoading(false);
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          throw new Error("Hesabınız aktif değil. Yönetici ile iletişime geçin.");
        }

        // staff web paneline giremez
        if (profile.role === "staff") {
          await supabase.auth.signOut();
          router.push("/yetkisiz-erisim");
          return;
        }

        // Middleware için rol çerezi
        document.cookie = `idari360_user_role=${profile.role}; path=/; max-age=86400`;
        router.push("/");

      } else {
        // ─── KAYIT OL ────────────────────────────────────────────
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: requestedRole,
            },
            emailRedirectTo: `${window.location.origin}/login?verified=1`,
          },
        });

        if (error) throw new Error(error.message);

        // Profil trigger ile otomatik oluşacak.
        // E-posta doğrulama bekleniyor ekranını göster.
        setStep("verify_email");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      // Türkçe mesajlar
      let msg = err.message;
      if (msg.includes("Invalid login credentials")) msg = "E-posta veya şifre hatalı.";
      if (msg.includes("Email not confirmed")) msg = "E-posta adresiniz henüz doğrulanmamış.";
      if (msg.includes("User already registered")) msg = "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
      if (msg.includes("Password should be at least")) msg = "Şifre en az 6 karakter olmalıdır.";
      setErrorMsg(msg);
    }

    setLoading(false);
  };

  // ─── E-POSTA DOĞRULAMA BEKLİYOR ─────────────────────────────
  if (step === "verify_email") {
    return (
      <AuthShell>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">E-posta Doğrulama</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            <strong className="text-slate-700">{email}</strong> adresine doğrulama bağlantısı gönderildi.
            Bağlantıya tıkladıktan sonra yönetici onayını bekleyin.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-800">
            <p className="font-bold mb-1">⏳ Sonraki Adım:</p>
            <p>E-postayı doğruladıktan sonra hesabınız <strong>yönetici onayına</strong> gönderilecektir. Onaylandığınızda sisteme giriş yapabilirsiniz.</p>
          </div>
          <button
            onClick={() => { setStep("form"); setIsLogin(true); }}
            className="mt-6 text-sm text-blue-600 hover:underline font-medium flex items-center gap-1 mx-auto"
          >
            Giriş ekranına dön <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </AuthShell>
    );
  }

  // ─── YÖNETİCİ ONAYI BEKLİYOR ─────────────────────────────────
  if (step === "pending_approval") {
    return (
      <AuthShell>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Onay Bekleniyor</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            E-posta adresinizi doğruladınız. Hesabınız şu anda <strong className="text-amber-600">yönetici onayı</strong> beklemektedir.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /><span>E-posta doğrulandı</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500 shrink-0" /><span>Yönetici onayı bekleniyor...</span></div>
            <div className="flex items-center gap-2 opacity-40"><Shield className="w-4 h-4 shrink-0" /><span>Panel erişimi</span></div>
          </div>
          <button
            onClick={() => { setStep("form"); setEmail(""); }}
            className="mt-6 text-sm text-blue-600 hover:underline font-medium"
          >
            Farklı bir hesapla giriş yap
          </button>
        </div>
      </AuthShell>
    );
  }

  // ─── HESAP REDDEDİLDİ ────────────────────────────────────────
  if (step === "rejected") {
    return (
      <AuthShell>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Hesap başvurunuz yönetici tarafından reddedilmiştir. Daha fazla bilgi için idari işler yöneticisi ile iletişime geçin.
          </p>
          <button
            onClick={() => setStep("form")}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Geri dön
          </button>
        </div>
      </AuthShell>
    );
  }

  // ─── ANA FORM ────────────────────────────────────────────────
  return (
    <AuthShell>
      {/* Tab Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(""); }}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Giriş Yap
        </button>
        <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(""); }}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Kayıt Ol
        </button>
      </div>

      {!isLogin && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
          <strong>Bilgi:</strong> Kayıt olduktan sonra e-posta doğrulaması ve yönetici onayı gereklidir.
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input type="text" required={!isLogin} value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Talep Edilen Rol</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select value={requestedRole} onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition appearance-none cursor-pointer">
                  <option value="facility_specialist">Uzman (Kendi Tesisi + Rapor)</option>
                  <option value="facility_supervisor">Sorumlu (Sadece İşlemler)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Yönetici rolü yalnızca mevcut yöneticiler tarafından atanabilir.</p>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">E-posta Adresi</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Şifre</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition" />
          </div>
        </div>

        {isLogin && (
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300" />
              Beni Hatırla
            </label>
            <a href="#" className="text-blue-600 hover:underline font-medium">Şifremi Unuttum?</a>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-70 mt-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>İşleniyor...</span></> : <span>{isLogin ? "Sisteme Giriş Yap" : "Hesap Oluştur"}</span>}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">İdari 360 • Supabase Auth & RLS ile güvence altında</p>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-700 rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            İdari<span className="text-blue-600">360</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">İdari İşler Yönetim Süreç Platformu</p>
        </div>
        {children}
      </div>
    </div>
  );
}
