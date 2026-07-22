"use client";

import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { InterviewSession } from "@/features/interview/interview-session";
import { useParams } from "next/navigation";

export default function InterviewSessionPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <InterviewSession interviewId={id} />
      </div>
    </ProtectedRoute>
  );
}
