"use client";

import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ResumeBuilderPage } from "@/features/resume-builder/resume-builder-page";

export default function NewBuilderPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <ResumeBuilderPage />
      </div>
    </ProtectedRoute>
  );
}
