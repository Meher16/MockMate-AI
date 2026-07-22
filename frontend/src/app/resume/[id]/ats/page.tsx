"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AtsReport, AtsReportSkeleton } from "@/features/ats/ats-report";
import { resumeService } from "@/services/resume.service";
import { atsService } from "@/services/ats.service";
import type { Resume, AtsScore } from "@/types/resume";

export default function AtsPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [score, setScore] = useState<AtsScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      resumeService.get(resumeId),
      atsService.getLatestForResume(resumeId),
    ])
      .then(([resumeData, scoreData]) => {
        setResume(resumeData);
        setScore(scoreData);
      })
      .finally(() => setIsLoading(false));
  }, [resumeId]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        {isLoading || !resume ? (
          <AtsReportSkeleton />
        ) : (
          <AtsReport
            resumeId={resumeId}
            resumeTitle={resume.title}
            initialScore={score}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
