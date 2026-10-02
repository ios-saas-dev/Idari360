"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, User, Shield, LogOut, Check } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { UserRole } from "@/lib/supabase/types";
import { getRoleLabel } from "@/lib/utils";

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function Header({ currentRole = "facility_admin", onRoleChange }: HeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    document.cookie = `idari360_user_role=${role}; path=/; max-age=86400`;
    if (onRoleChange) {
      onRoleChange(role);
    }
    setShowRoleDropdown(false);
    if (role === "staff") {
      window.location.href = "/yetkisiz-erisim";
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Aramak istediğiniz alanı yazın..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition relative"
            title="Bildirimler"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center absolute -top-0.5 -right-0.5 shadow-sm">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-900">Bildirimler (3)</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer">Tümünü Oku</span>
              </div>
              <div className="space-y-3 mt-3 text-xs">
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="font-semibold text-slate-800">Servis Denetimi Yaklaşıyor</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">34 ABC 123 nolu servis aracının periyodik denetimine 3 gün kaldı.</div>
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="font-semibold text-slate-800">Yemekhane Açık Aksiyon</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Agora Şubesi el yıkama istasyonu termin tarihi yarın doluyor.</div>
                </div>
                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="font-semibold text-slate-800">Temizlik Onayı Tamamlandı</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Maslak Genel Merkez zemin derin temizlik aksiyonu kapatıldı.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Role Selector */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-3 p-1.5 pr-2 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-100">
              <User className="w-5 h-5 text-slate-200" />
            </div>

            {/* User Meta */}
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {getRoleLabel(currentRole)}
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {/* Role switcher dropdown for pair-programming and client demo */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                Rol ve Yetki Değiştir (Test):
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleRoleSelect("facility_admin")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    currentRole === "facility_admin"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>İdari İşler Yöneticisi</span>
                  </div>
                  {currentRole === "facility_admin" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>

                <button
                  onClick={() => handleRoleSelect("facility_specialist")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    currentRole === "facility_specialist"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>İdari İşler Uzmanı</span>
                  </div>
                  {currentRole === "facility_specialist" && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                <button
                  onClick={() => handleRoleSelect("facility_supervisor")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    currentRole === "facility_supervisor"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>İdari İşler Sorumlusu</span>
                  </div>
                  {currentRole === "facility_supervisor" && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                <button
                  onClick={() => handleRoleSelect("staff")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    currentRole === "staff"
                      ? "bg-red-50 text-red-700 font-semibold"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Personel (Engeli Test Et)</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
