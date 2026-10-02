import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserRole } from "./supabase/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "facility_admin":
      return "İdari İşler Yöneticisi";
    case "facility_specialist":
      return "İdari İşler Uzmanı";
    case "facility_supervisor":
      return "İdari İşler Sorumlusu";
    case "staff":
      return "Personel (Mobil)";
    default:
      return "Kullanıcı";
  }
}

export function getCategoryBadgeColor(category: string): string {
  switch (category.toLowerCase()) {
    case "yemekhane":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "servis":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "filo":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "temizlik":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "varlik":
    case "varliklar":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "guvenlik":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}
