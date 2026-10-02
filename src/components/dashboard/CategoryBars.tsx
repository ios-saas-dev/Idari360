"use client";

import { dashboardStats } from "@/lib/mock-data";

export function CategoryBars() {
  const items = dashboardStats.categoryRanking;
  const maxVal = Math.max(...items.map((i) => i.count));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight mb-4">
        En Çok Talep Oluşturulan Kategoriler
      </h3>

      <div className="space-y-3.5 my-auto">
        {items.map((item, idx) => {
          const widthPercent = (item.count / maxVal) * 100;

          return (
            <div key={idx} className="flex items-center gap-4 text-xs">
              {/* Category Label */}
              <span className="w-20 font-medium text-slate-700 text-xs shrink-0">
                {item.name}
              </span>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* Numeric Value */}
              <span className="w-5 text-right font-bold text-slate-800 text-xs">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
