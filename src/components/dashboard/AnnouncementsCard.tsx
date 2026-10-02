"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { announcements } from "@/lib/mock-data";

export function AnnouncementsCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">
            Duyurular
          </h3>
        </div>

        <div className="space-y-4">
          {announcements.map((item) => (
            <div key={item.id} className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                  <span className="font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {item.date}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-3.5 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-2">
        <Link
          href="/duyurular"
          className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          Tüm Duyurular
        </Link>
      </div>
    </div>
  );
}
