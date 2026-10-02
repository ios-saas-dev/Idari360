"use client";

import { AuditForm } from "@/components/audit/AuditForm";
import { foodAuditQuestions } from "@/lib/mock-data";

export default function YemekhaneDenetimiPage() {
  return (
    <div className="space-y-6">
      <AuditForm
        title="Yemekhane Hijyen, HACCP ve Standart Denetim Formu"
        category="yemekhane"
        questions={foodAuditQuestions}
        targetName="Agora Şubesi Ana Yemek Salonu"
      />
    </div>
  );
}
