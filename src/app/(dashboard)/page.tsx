"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { StatCards } from "@/components/dashboard/StatCards";
import { DemandDistributionChart } from "@/components/dashboard/DemandDistributionChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { CategoryBars } from "@/components/dashboard/CategoryBars";
import { SatisfactionGauge } from "@/components/dashboard/SatisfactionGauge";
import { BottomCategories } from "@/components/dashboard/BottomCategories";
import SmartInsights from "@/components/dashboard/SmartInsights";
import { getDashboardStats } from "@/lib/services/dashboard-service";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      const data = await getDashboardStats();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Hoş geldiniz, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Tüm idari süreçleri buradan yönetebilirsiniz.
          </p>
        </div>

        {/* Date Filter Badge / Button */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition w-fit">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>{stats.dateDisplay}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      </div>

      {/* Row 1: 4 Key Metric Cards */}
      <StatCards stats={stats} />

      {/* Row 2: Distribution Chart, Monthly Trend, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-4 min-h-[260px]">
          <DemandDistributionChart stats={stats} />
        </div>
        <div className="lg:col-span-5 min-h-[260px]">
          <MonthlyTrendChart stats={stats} />
        </div>
        <div className="lg:col-span-3 min-h-[260px]">
          <QuickActions />
        </div>
      </div>

      {/* Row 3: Announcements, Top Categories, Satisfaction Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 min-h-[270px]">
          <AnnouncementsCard />
        </div>
        <div className="lg:col-span-4 min-h-[270px]">
          <CategoryBars stats={stats} />
        </div>
        <div className="lg:col-span-3 min-h-[270px]">
          <SatisfactionGauge stats={stats} />
        </div>
      </div>

      {/* Row 4: Smart AI Insights */}
      <SmartInsights />

      {/* Row 5: Bottom Categories Quick Grid */}
      <BottomCategories />

    </div>
  );
}
