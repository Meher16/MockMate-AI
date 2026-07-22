"use client";

import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FeedbackReport } from "@/features/feedback/feedback-report";
import { useParams } from "next/navigation";

export default function InterviewFeedbackPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <FeedbackReport interviewId={id} />
      </div>
    </ProtectedRoute>
  );
}
