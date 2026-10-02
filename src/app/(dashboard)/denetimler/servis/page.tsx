"use client";

import { AuditForm } from "@/components/audit/AuditForm";
import { serviceAuditQuestions } from "@/lib/mock-data";

export default function ServisDenetimiPage() {
  return (
    <div className="space-y-6">
      <AuditForm
        title="Servis Aracı Standart & Güvenlik Denetimi"
        category="servis"
        questions={serviceAuditQuestions}
        targetName="34 ABC 123 (Kadıköy - Maslak Ekspres)"
      />
    </div>
  );
}
