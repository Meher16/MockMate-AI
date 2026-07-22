"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ResumeBuilderPage } from "@/features/resume-builder/resume-builder-page";
import { Skeleton } from "@/components/ui/motion";
import { resumeService } from "@/services/resume.service";
import { getBuilderDataFromResume } from "@/types/resume-builder";
import { createEmptyBuilderData } from "@/types/resume-builder";
import { useRouter } from "next/navigation";

export default function EditBuilderPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [initialTitle, setInitialTitle] = useState<string>();
  const [initialData, setInitialData] = useState<ReturnType<typeof createEmptyBuilderData>>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    resumeService.get(id).then((resume) => {
      const builderData = getBuilderDataFromResume(resume.parsedData);
      if (builderData) {
        setInitialTitle(resume.title);
        setInitialData(builderData);
      } else {
        const empty = createEmptyBuilderData();
        empty.summary = resume.rawText?.slice(0, 1000) ?? "";
        setInitialTitle(resume.title);
        setInitialData(empty);
      }
    }).catch(() => {
      router.replace("/resume");
    }).finally(() => setIsLoading(false));
  }, [id, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        {isLoading || !initialData ? (
          <div className="container mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="grid xl:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        ) : (
          <ResumeBuilderPage resumeId={id} initialTitle={initialTitle} initialData={initialData} />
        )}
      </div>
    </ProtectedRoute>
  );
}
