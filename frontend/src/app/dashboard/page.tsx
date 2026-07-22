"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { DashboardContent } from "@/features/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <DashboardContent />
      </div>
    </ProtectedRoute>
  );
}
