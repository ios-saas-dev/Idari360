"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UserRole } from "@/lib/supabase/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRole, setCurrentRole] = useState<UserRole>("facility_admin");

  useEffect(() => {
    // Read role from cookie
    const match = document.cookie.match(new RegExp("(^| )idari360_user_role=([^;]+)"));
    if (match && match[2]) {
      setCurrentRole(match[2] as UserRole);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f3f5f9]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
