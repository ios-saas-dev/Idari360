"use client";

import Link from "next/link";
import {
  Utensils,
  Bus,
  Car,
  Sparkles,
  Package,
  Building2,
  TrendingUp,
  Megaphone,
  Settings,
} from "lucide-react";

export function BottomCategories() {
  const categories = [
    {
      name: "Yemekhane",
      href: "/yemekhane",
      icon: Utensils,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      name: "Servis",
      href: "/servis",
      icon: Bus,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      name: "Filo",
      href: "/filo",
      icon: Car,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      name: "Temizlik",
      href: "/temizlik",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      name: "Varlıklar",
      href: "/varliklar",
      icon: Package,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      name: "Şubeler",
      href: "/subeler",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Raporlar",
      href: "/raporlar",
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      name: "Duyurular",
      href: "/duyurular",
      icon: Megaphone,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      name: "Ayarlar",
      href: "/ayarlar",
      icon: Settings,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
  ];

  return (
    <div className="mt-7">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight mb-3">
        Kategoriler
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3.5">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={idx}
              href={cat.href}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-2.5 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-semibold text-slate-700 tracking-tight group-hover:text-blue-600 transition">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
