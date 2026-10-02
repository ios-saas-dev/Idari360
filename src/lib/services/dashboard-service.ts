// Dashboard data servisi
import { createClient } from "@/lib/supabase/client";

export async function getDashboardStats() {
  const supabase = createClient();

  // 1. Fetch all operations to calculate stats
  const { data: operations, error } = await supabase
    .from("operations")
    .select("category, status, created_at, priority");

  if (error || !operations) {
    console.error("Dashboard operations fetch error:", error);
    return null;
  }

  const now = new Date();
  
  // Calculate top-level stats
  const openDemandsCount = operations.length; // Or filter by not tamamlandı
  const inProgressCount = operations.filter((o) => o.status === "devam_ediyor").length;
  const pendingApprovalsCount = operations.filter((o) => o.status === "onayda").length;
  
  // Calculate completed this month
  const completedCount = operations.filter((o) => {
    if (o.status !== "tamamlandi") return false;
    const date = new Date(o.created_at);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // Status distribution
  const statusCounts = {
    yeni: 0, devam_ediyor: 0, beklemede: 0, onayda: 0, tamamlandi: 0
  };
  operations.forEach(o => {
    if (statusCounts[o.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[o.status as keyof typeof statusCounts]++;
    }
  });

  const total = operations.length || 1; // avoid division by zero
  const statusDistribution = [
    { name: "Yeni", value: statusCounts.yeni, percentage: `${((statusCounts.yeni / total) * 100).toFixed(1)}%`, color: "#2563eb" },
    { name: "Devam Ediyor", value: statusCounts.devam_ediyor, percentage: `${((statusCounts.devam_ediyor / total) * 100).toFixed(1)}%`, color: "#06b6d4" },
    { name: "Beklemede", value: statusCounts.beklemede, percentage: `${((statusCounts.beklemede / total) * 100).toFixed(1)}%`, color: "#f59e0b" },
    { name: "Onayda", value: statusCounts.onayda, percentage: `${((statusCounts.onayda / total) * 100).toFixed(1)}%`, color: "#8b5cf6" },
    { name: "Tamamlandı", value: statusCounts.tamamlandi, percentage: `${((statusCounts.tamamlandi / total) * 100).toFixed(1)}%`, color: "#10b981" },
  ];

  // Category ranking
  const categoryCounts: Record<string, number> = {};
  operations.forEach(o => {
    categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
  });
  
  const categoryRanking = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], index) => {
      const colors = ["#3b82f6", "#06b6d4", "#f59e0b", "#8b5cf6", "#94a3b8"];
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: colors[index % colors.length]
      };
    });

  // Calculate monthly trend (last 6 months)
  const monthlyTrend = [];
  const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    
    const count = operations.filter(o => {
      const oDate = new Date(o.created_at);
      return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
    }).length;

    monthlyTrend.push({
      month: monthNames[d.getMonth()],
      demands: count
    });
  }

  // Date format for display
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
  const dateDisplay = now.toLocaleDateString("tr-TR", dateOptions);

  return {
    dateDisplay,
    openDemands: { count: openDemandsCount, subtext: `Toplam ${openDemandsCount} talep` },
    inProgress: { count: inProgressCount, subtext: "Devam eden işler" },
    completed: { count: completedCount, subtext: "Bu ay tamamlanan" },
    pendingApprovals: { count: pendingApprovalsCount, subtext: "Onay bekleyen" },
    statusDistribution,
    monthlyTrend,
    categoryRanking,
    satisfaction: {
      score: 4.6,
      maxScore: 5,
      title: "Yemekhane Memnuniyet Skoru",
      growth: "%8.2 artış (Geçen aya göre)",
    }
  };
}
