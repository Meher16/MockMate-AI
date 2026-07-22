"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Download, Printer, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderForm, useBuilderForm } from "@/features/resume-builder/builder-form";
import { ResumePreview } from "@/features/resume-builder/resume-preview";
import { PageTransition } from "@/components/ui/motion";
import { resumeBuilderService } from "@/services/resume-builder.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import type { ResumeBuilderData } from "@/types/resume-builder";
import { createEmptyBuilderData } from "@/types/resume-builder";

interface ResumeBuilderPageProps {
  resumeId?: string;
  initialTitle?: string;
  initialData?: ResumeBuilderData;
}

export function ResumeBuilderPage({ resumeId, initialTitle, initialData }: ResumeBuilderPageProps) {
  const form = useBuilderForm({
    title: initialTitle ?? "My Resume",
    builderData: initialData ?? createEmptyBuilderData(),
  });
  const { watch, handleSubmit } = form;
  const builderData = watch("builderData");
  const [savedId, setSavedId] = useState<string | undefined>(resumeId);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSave = handleSubmit(async (values) => {
    if (!values.builderData.personalInfo.fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (savedId) {
        await resumeBuilderService.update(savedId, values.title, values.builderData);
        toast({ title: "Resume saved", variant: "success" });
      } else {
        const resume = await resumeBuilderService.create(values.title, values.builderData);
        setSavedId(resume.id);
        toast({ title: "Resume created", variant: "success" });
        router.replace(`/resume/builder/${resume.id}`);
      }
    } catch (error) {
      toast({ title: "Save failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  });

  const handleExportPdf = async () => {
    if (!savedId) {
      toast({ title: "Save first", description: "Save your resume before exporting", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      await resumeBuilderService.exportPdf(savedId);
      toast({ title: "PDF downloaded", variant: "success" });
    } catch (error) {
      toast({ title: "Export failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const preview = document.getElementById("resume-preview");
    if (!preview) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Resume</title>
      <style>body{margin:0;padding:20px;font-family:system-ui,sans-serif} @media print{body{padding:0}}</style>
      </head><body>${preview.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <PageTransition className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/resume">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">Build an ATS-friendly resume with live preview</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleExportPdf} isLoading={isExporting} className="gap-2">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          {savedId && (
            <Link href={`/resume/${savedId}/ats`}>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" /> ATS Check
              </Button>
            </Link>
          )}
          <Button variant="gradient" onClick={onSave} isLoading={isSaving} className="gap-2">
            <Save className="h-4 w-4" /> {savedId ? "Save Changes" : "Create Resume"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
          <BuilderForm form={form} />
        </div>

        <div className="xl:sticky xl:top-20 xl:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h2>
            <span className="text-xs text-muted-foreground capitalize">{builderData.template} template</span>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4 overflow-auto max-h-[calc(100vh-220px)]">
            <ResumePreview data={builderData} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
