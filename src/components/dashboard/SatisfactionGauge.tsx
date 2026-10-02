"use client";
import { ArrowUp } from "lucide-react";

export function SatisfactionGauge({ 
  stats,
  score: propScore,
  maxScore: propMaxScore,
  title: propTitle,
  growth: propGrowth
}: { 
  stats?: any,
  score?: number,
  maxScore?: number,
  title?: string,
  growth?: string
}) {
  const score = propScore ?? (stats?.satisfaction?.score || 4.6);
  const maxScore = propMaxScore ?? (stats?.satisfaction?.maxScore || 5);
  const title = propTitle ?? (stats?.satisfaction?.title || "Memnuniyet Skoru");
  const growth = propGrowth ?? (stats?.satisfaction?.growth || "%0.0");
  // Circular gauge math (75% circle arc)
  const radius = 42;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  // Use 270 degree arc for gauge look
  const totalArc = circumference * 0.75;
  const progressArc = Math.min(totalArc, (score / maxScore) * totalArc);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between text-center">
      <h3 className="text-xs font-bold text-slate-800 tracking-tight text-left">
        Yemekhane Memnuniyet Skoru
      </h3>

      <div className="flex flex-col items-center justify-center my-auto py-2">
        {/* Semi-circular gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              strokeDasharray={`${totalArc} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${progressArc} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Centered Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              /{maxScore}
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="text-xs font-bold text-slate-800 mt-2">
          {title}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{growth}</span>
        </div>
      </div>
    </div>
  );
}
