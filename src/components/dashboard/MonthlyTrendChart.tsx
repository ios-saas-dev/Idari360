"use client";

export function MonthlyTrendChart() {
  const data = [
    { month: "Oca", val: 20 },
    { month: "Şub", val: 38 },
    { month: "Mar", val: 44 },
    { month: "Nis", val: 36 },
    { month: "May", val: 56, tooltip: "Mayıs 56 Talep" },
    { month: "Haz", val: 70 },
  ];

  // SVG dimensions
  const width = 360;
  const height = 170;
  const paddingX = 35;
  const paddingY = 25;
  const chartWidth = width - paddingX - 15;
  const chartHeight = height - paddingY * 2;

  // Max value is 80 as in reference image
  const maxVal = 80;
  const getX = (idx: number) => paddingX + (idx / (data.length - 1)) * chartWidth;
  const getY = (val: number) => height - paddingY - (val / maxVal) * chartHeight;

  // Smooth cubic bezier path string
  let pathD = `M ${getX(0)} ${getY(data[0].val)}`;
  for (let i = 0; i < data.length - 1; i++) {
    const x0 = getX(i);
    const y0 = getY(data[i].val);
    const x1 = getX(i + 1);
    const y1 = getY(data[i + 1].val);
    const xc = (x0 + x1) / 2;
    pathD += ` C ${xc} ${y0}, ${xc} ${y1}, ${x1} ${y1}`;
  }

  // Area fill path
  const areaD = `${pathD} L ${getX(data.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight">
          Aylık Talep Trendi
        </h3>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines & Y labels (0, 20, 40, 60, 80) */}
          {[0, 20, 40, 60, 80].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - 15}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium select-none"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Area Gradient Fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Smooth Trend Line */}
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {data.map((item, idx) => {
            const cx = getX(idx);
            const cy = getY(item.val);
            const isMay = item.month === "May";

            return (
              <g key={idx}>
                {/* Outer halo for active point */}
                {isMay && (
                  <circle cx={cx} cy={cy} r="6" fill="#3b82f6" fillOpacity="0.3" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:scale-125"
                />

                {/* X Axis Month Label */}
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-medium select-none"
                >
                  {item.month}
                </text>
              </g>
            );
          })}

          {/* Tooltip for May (as in reference image: "Mayıs 56 Talep") */}
          <g transform={`translate(${getX(4) - 36}, ${getY(56) - 34})`}>
            <rect
              width="72"
              height="24"
              rx="6"
              fill="#ffffff"
              stroke="#e2e8f0"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
            />
            <text
              x="36"
              y="15"
              textAnchor="middle"
              className="text-[9px] font-bold fill-slate-800 tracking-tight"
            >
              Mayıs 56 Talep
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
