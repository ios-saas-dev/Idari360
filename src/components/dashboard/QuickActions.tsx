"use client";

import Link from "next/link";
import { Plus, Bus, Utensils, Sparkles, Box, ChevronRight } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Yeni Talep Oluştur",
      href: "/talepler?yeni=true",
      icon: Plus,
      bgColor: "bg-blue-500",
      textColor: "text-white",
    },
    {
      title: "Servis Denetim Formu",
      href: "/denetimler/servis",
      icon: Bus,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Yemekhane Denetim Formu",
      href: "/denetimler/yemekhane",
      icon: Utensils,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Temizlik Denetim Formu",
      href: "/denetimler/temizlik",
      icon: Sparkles,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Stok Takip Desbord",
      href: "/varliklar",
      icon: Box,
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight mb-3">
        Hızlı İşlemler
      </h3>

      <div className="space-y-2.5">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg ${item.bgColor} ${item.textColor} flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition">
                  {item.title}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
