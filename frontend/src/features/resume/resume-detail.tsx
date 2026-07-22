"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resumeService } from "@/services/resume.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import type { Resume } from "@/types/resume";
import { PageTransition } from "@/components/ui/motion";

interface ResumeDetailProps {
  resume: Resume;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
};

export function ResumeDetail({ resume: initial }: ResumeDetailProps) {
  const [resume, setResume] = useState(initial);
  const [title, setTitle] = useState(resume.title);
  const [rawText, setRawText] = useState(resume.rawText ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const sections = resume.parsedData?.sections ?? {};

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await resumeService.update(resume.id, { title, rawText });
      setResume(updated);
      setIsEditing(false);
      toast({ title: "Resume saved", variant: "success" });
      router.refresh();
    } catch (error) {
      toast({ title: "Save failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/resume">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-sm text-muted-foreground">
              {resume.parsedData?.wordCount ?? 0} words · {resume.parsedData?.pageCount ?? 1} page(s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/resume/${resume.id}/ats`}>
            <Button variant="gradient" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Run ATS Check
            </Button>
          </Link>
          {isEditing ? (
            <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
              <Save className="h-4 w-4" /> Save
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detected Sections</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={sections[key] ? "success" : "secondary"}
                >
                  {label} {sections[key] ? "✓" : "✗"}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {resume.parsedData?.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Email: {resume.parsedData.contactInfo.hasEmail ? "✓ Found" : "✗ Missing"}</p>
                <p>Phone: {resume.parsedData.contactInfo.hasPhone ? "✓ Found" : "✗ Missing"}</p>
                <p>LinkedIn: {resume.parsedData.contactInfo.hasLinkedIn ? "✓ Found" : "✗ Missing"}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rawText">Extracted Text</Label>
                    <Textarea
                      id="rawText"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={20}
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground max-h-[600px] overflow-y-auto rounded-lg bg-secondary/30 p-4">
                  {resume.rawText ?? "No text content available."}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
