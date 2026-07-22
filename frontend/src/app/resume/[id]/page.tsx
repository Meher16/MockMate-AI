"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ResumeDetail } from "@/features/resume/resume-detail";
import { Skeleton } from "@/components/ui/motion";
import { resumeService } from "@/services/resume.service";
import type { Resume } from "@/types/resume";

export default function ResumeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    resumeService.get(id).then(setResume).finally(() => setIsLoading(false));
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        {isLoading || !resume ? (
          <div className="container mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : (
          <ResumeDetail resume={resume} />
        )}
      </div>
    </ProtectedRoute>
  );
}
