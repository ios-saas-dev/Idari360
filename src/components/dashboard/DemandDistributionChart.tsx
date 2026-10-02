"use client";

export function DemandDistributionChart({ stats }: { stats: any }) {
  const items = stats.statusDistribution;
  const total = items.reduce((acc: any, curr: any) => acc + curr.value, 0);

  // Calculate SVG stroke dashes for donut segments
  let accumulatedAngle = 0;
  const radius = 56;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight mb-4">
        Taleplerin Durumuna Göre Dağılımı
      </h3>

      <div className="flex items-center justify-between gap-4 my-auto">
        {/* SVG Donut Chart */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {items.map((item: any, idx: number) => {
              const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedAngle;
              accumulatedAngle += (item.value / total) * circumference;

              return (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-medium text-slate-400">Toplam</span>
            <span className="text-2xl font-black text-slate-900 leading-tight">{total}</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 space-y-2 text-xs">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700 text-xs">{item.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-xs">{item.value}</span>
                <span className="text-[11px] text-slate-400 w-11 text-right">{item.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
