import { ClipboardList, Hourglass, CheckCircle2, UserCheck } from "lucide-react";
import { dashboardStats } from "@/lib/mock-data";

export function StatCards() {
  const cards = [
    {
      title: "Açık Talepler",
      count: dashboardStats.openDemands.count,
      subtext: dashboardStats.openDemands.subtext,
      icon: ClipboardList,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Devam Eden İşler",
      count: dashboardStats.inProgress.count,
      subtext: dashboardStats.inProgress.subtext,
      icon: Hourglass,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "Tamamlanan İşler",
      count: dashboardStats.completed.count,
      subtext: dashboardStats.completed.subtext,
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Bekleyen Onaylar",
      count: dashboardStats.pendingApprovals.count,
      subtext: dashboardStats.pendingApprovals.subtext,
      icon: UserCheck,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 tracking-tight">
                  {card.title}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  {card.count}
                </div>
              </div>

              <div
                className={`w-11 h-11 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium mt-3">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
