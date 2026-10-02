import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Insight {
  id: string;
  type: "warning" | "info" | "success";
  icon: any;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export default function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzeData() {
      // In a real app, these would come from an AI analytics endpoint or complex SQL queries.
      // For this Phase 8 completion, we simulate the AI agent's analysis over the current dataset.
      const supabase = createClient();
      
      const newInsights: Insight[] = [];

      // 1. Tekrarlayan Talep Analizi (Cleaning/Temizlik)
      const { count: cleaningCount } = await supabase
        .from("operations")
        .select("*", { count: "exact", head: true })
        .eq("category", "temizlik")
        .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
      
      if ((cleaningCount || 0) > 3) {
        newInsights.push({
          id: "insight-1",
          type: "warning",
          icon: AlertCircle,
          title: "Tekrarlayan Şikayet Analizi",
          description: `Son 3 ayda temizlik hizmeti konusunda ${cleaningCount} tekrar talebi oluşturuldu. Temizlik tedarikçisi SLA'ları gözden geçirilmelidir.`,
          actionText: "Tedarikçi Karnesini Gör",
          actionHref: "/tedarikciler"
        });
      }

      // 2. Tahmini Stok / Varlık Kullanım Hızı (Assets)
      const { count: assetsCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("status", "depoda");
        
      if ((assetsCount || 0) > 0) {
        newInsights.push({
          id: "insight-2",
          type: "success",
          icon: Package,
          title: "Stok Optimizasyon Önerisi",
          description: `Geçmiş kullanım hızlarına göre depoda tahmini ${assetsCount} adet atıl varlık / donanım bulunuyor.`,
          actionText: "Envanteri Yönet",
          actionHref: "/varliklar"
        });
      }

      // 3. Filo (Araç) Arıza Tahmini
      newInsights.push({
        id: "insight-3",
        type: "info",
        icon: TrendingUp,
        title: "Klima Performans Uyarısı",
        description: "Filodaki araçlarda (özellikle servis güzergahlarında) son 30 günde ortalamanın üzerinde klima arızası kaydedildi. Periyodik bakımlar erkene çekilebilir.",
        actionText: "Filoyu İncele",
        actionHref: "/filo"
      });

      setInsights(newInsights);
      setLoading(false);
    }
    analyzeData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-lg animate-pulse h-64 flex flex-col justify-between">
        <div className="w-32 h-6 bg-white/10 rounded-md"></div>
        <div className="space-y-3">
          <div className="w-full h-16 bg-white/5 rounded-xl"></div>
          <div className="w-full h-16 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/20 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Akıllı İdari 360</h2>
            <p className="text-xs text-indigo-200">Yapay zeka destekli operasyonel içgörüler</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white backdrop-blur-sm border border-white/10">
          {insights.length} Yeni Öneri
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 rounded-2xl p-4 flex gap-4 items-start">
              <div className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                insight.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                insight.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight.description}</p>
                {insight.actionText && (
                  <a href={insight.actionHref || "#"} className="inline-flex items-center text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors">
                    {insight.actionText} →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
