"use client";

import { useCallback, useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageTransition, Skeleton } from "@/components/ui/motion";
import { InterviewSetup } from "@/features/interview/interview-setup";
import { InterviewHistory } from "@/features/interview/interview-history";
import { interviewService } from "@/services/interview.service";
import { resumeService } from "@/services/resume.service";
import type { Interview } from "@/types/interview";
import type { Resume } from "@/types/resume";

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [interviewData, resumeData] = await Promise.all([
      interviewService.list(),
      resumeService.list(),
    ]);
    setInterviews(interviewData);
    setResumes(resumeData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <PageTransition className="container mx-auto px-4 py-8 space-y-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Mic className="h-8 w-8 text-primary" />
              <span>AI <span className="gradient-text">Interview</span></span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Practice with AI-generated questions tailored to your domain and resume
            </p>
          </div>

          <InterviewSetup resumes={resumes} />

          <div>
            <h2 className="text-xl font-semibold mb-4">Interview History</h2>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            ) : (
              <InterviewHistory interviews={interviews} />
            )}
          </div>
        </PageTransition>
      </div>
    </ProtectedRoute>
  );
}
