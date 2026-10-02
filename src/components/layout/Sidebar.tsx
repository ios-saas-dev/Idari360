"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Utensils,
  Bus,
  Car,
  Package,
  Sparkles,
  Building2,
  BarChart3,
  Megaphone,
  Settings,
  Hexagon,
} from "lucide-react";
import { WarehouseIllustration } from "./WarehouseIllustration";

const navItems = [
  { name: "Ana Sayfa", href: "/", icon: Home },
  { name: "Talepler", href: "/talepler", icon: ClipboardList, badge: "12" },
  { name: "Yemekhane", href: "/yemekhane", icon: Utensils },
  { name: "Servis", href: "/servis", icon: Bus },
  { name: "Filo Yönetimi", href: "/filo", icon: Car },
  { name: "Varlık Yönetimi", href: "/varliklar", icon: Package },
  { name: "Temizlik", href: "/temizlik", icon: Sparkles },
  { name: "Şubeler", href: "/subeler", icon: Building2 },
  { name: "Raporlar", href: "/raporlar", icon: BarChart3 },
  { name: "Duyurular", href: "/duyurular", icon: Megaphone },
  { name: "Ayarlar", href: "/ayarlar", icon: Settings },
];

const adminOnlyItems = [
  { name: "Kullanıcı Yönetimi", href: "/kullanicilar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#051837] text-white flex flex-col shrink-0 min-h-screen select-none border-r border-[#0e2752]">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="relative flex items-center justify-center">
          <Hexagon className="w-9 h-9 text-blue-500 fill-blue-500/20" strokeWidth={2.2} />
          <div className="w-3 h-3 rounded-full bg-cyan-400 absolute shadow-[0_0_10px_#22d3ee]" />
        </div>
        <div className="flex items-baseline tracking-tight">
          <span className="text-xl font-bold text-white tracking-tight">idari</span>
          <span className="text-xl font-black text-cyan-400">360</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} strokeWidth={2} />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-[11px] font-bold rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Illustration & Slogan Card */}
      <div className="p-4 pt-1 mt-auto">
        <div className="bg-[#04122b]/80 border border-white/5 rounded-2xl p-3 text-center">
          <WarehouseIllustration />
          <p className="text-xs font-semibold text-slate-300 mt-1 tracking-tight">
            İdari İşler Yönetim
          </p>
          <p className="text-[11px] text-cyan-400 font-medium">
            Süreç Platformu
          </p>
        </div>
      </div>
      {/* Admin Only: Kullanıcı Yönetimi */}
      <div className="px-3 pb-2">
        <div className="border-t border-white/10 pt-2">
          <Link
            href="/kullanicilar"
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/kullanicilar"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4" strokeWidth={2} />
            <span>Kullanıcı Yönetimi</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
