"use client";

import { AuditForm } from "@/components/audit/AuditForm";
import { cleaningAuditQuestions } from "@/lib/mock-data";

export default function TemizlikDenetimiPage() {
  return (
    <div className="space-y-6">
      <AuditForm
        title="Tesis, Depo ve Saha Temizlik Denetim Formu"
        category="temizlik"
        questions={cleaningAuditQuestions}
        targetName="Maslak Genel Merkez & Lojistik Alanı"
      />
    </div>
  );
}
