"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Star, Trash2, Download, BarChart3, Eye, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, ScoreBadge } from "@/components/ui/badge";
import { formatDate } from "@/utils/cn";
import type { Resume } from "@/types/resume";
import { isBuiltResume } from "@/types/resume-builder";
import { resumeService } from "@/services/resume.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import { useState } from "react";

interface ResumeListProps {
  resumes: Resume[];
  onRefresh: () => void;
}

export function ResumeList({ resumes, onRefresh }: ResumeListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await resumeService.delete(id);
      toast({ title: "Resume deleted", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Delete failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await resumeService.update(id, { isPrimary: true });
      toast({ title: "Primary resume updated", variant: "success" });
      onRefresh();
    } catch (error) {
      toast({ title: "Update failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await resumeService.download(id);
    } catch (error) {
      toast({ title: "Download failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No resumes yet</p>
          <p className="text-sm mt-1">Upload your first PDF resume to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {resumes.map((resume, i) => {
        const latestScore = resume.atsScores?.[0];
        const parsed = resume.parsedData;
        const isBuilt = isBuiltResume(resume.parsedData);

        return (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{resume.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {resume.fileName ?? "Text resume"} · Updated {formatDate(resume.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {resume.isPrimary && (
                    <Badge variant="success" className="shrink-0 gap-1">
                      <Star className="h-3 w-3" /> Primary
                    </Badge>
                  )}
                  {isBuilt && (
                    <Badge variant="default" className="shrink-0">Built</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {parsed?.wordCount && <span>{parsed.wordCount} words</span>}
                  {parsed?.pageCount && <span>· {parsed.pageCount} page(s)</span>}
                  {latestScore && (
                    <span className="flex items-center gap-1">
                      · ATS: <ScoreBadge score={latestScore.score} />
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {isBuilt ? (
                    <Link href={`/resume/builder/${resume.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <PenLine className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/resume/${resume.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                  )}
                  <Link href={`/resume/${resume.id}/ats`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <BarChart3 className="h-3.5 w-3.5" /> ATS Check
                    </Button>
                  </Link>
                  {resume.filePath && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(resume.id)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!resume.isPrimary && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(resume.id)}>
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingId === resume.id}
                    onClick={() => handleDelete(resume.id, resume.title)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
