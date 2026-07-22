"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, PenLine } from "lucide-react";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageTransition, Skeleton } from "@/components/ui/motion";
import { ResumeUpload } from "@/features/resume/resume-upload";
import { ResumeList } from "@/features/resume/resume-list";
import { Button } from "@/components/ui/button";
import { resumeService } from "@/services/resume.service";
import { getErrorMessage } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@/types/resume";

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadResumes = useCallback(async () => {
    try {
      const data = await resumeService.list();
      setResumes(data);
    } catch (error) {
      toast({ title: "Failed to load resumes", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <DashboardNavbar />
        <PageTransition className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <span>My <span className="gradient-text">Resumes</span></span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload, build, and analyze your resumes for ATS compatibility
              </p>
            </div>
            <Link href="/resume/builder">
              <Button variant="gradient" className="gap-2">
                <PenLine className="h-4 w-4" />
                Create Resume
              </Button>
            </Link>
          </div>

          <ResumeUpload onSuccess={loadResumes} />

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          ) : (
            <ResumeList resumes={resumes} onRefresh={loadResumes} />
          )}
        </PageTransition>
      </div>
    </ProtectedRoute>
  );
}
