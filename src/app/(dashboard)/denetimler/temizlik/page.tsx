"use client";

import { useState, useEffect } from "react";
import { AuditForm } from "@/components/audit/AuditForm";
import { getAuditTemplateAndQuestions } from "@/lib/services/audits-service";
import { AuditQuestion } from "@/lib/supabase/types";
import { RefreshCw } from "lucide-react";

export default function TemizlikDenetimiPage() {
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { template, questions } = await getAuditTemplateAndQuestions("temizlik");
        setTemplate(template);
        setQuestions(questions);
      } catch (err) {
        console.error("Temizlik questions load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-slate-500 font-medium border border-slate-100">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
        Tesis ve saha temizlik denetim soruları Supabase üzerinden alınıyor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuditForm
        title={template?.title || "Tesis, Depo ve Saha Temizlik Denetim Formu (100 Puan)"}
        category="temizlik"
        questions={questions}
        templateId={template?.id}
        defaultTargetName="Agora Şubesi & Lojistik Alanı"
      />
    </div>
  );
}
