"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ScoreBadge } from "@/components/ui/badge";
import { PageTransition, Skeleton } from "@/components/ui/motion";
import { atsService } from "@/services/ats.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import type { AtsScore, AtsReportData } from "@/types/resume";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface AtsReportProps {
  resumeId: string;
  resumeTitle: string;
  initialScore: AtsScore | null;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold">{score}</div>
        <div className="text-xs text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}

function BreakdownBar({ label, score, max, feedback }: { label: string; score: number; max: number; feedback: string }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-muted-foreground">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{feedback}</p>
    </div>
  );
}

export function AtsReport({ resumeId, resumeTitle, initialScore }: AtsReportProps) {
  const [score, setScore] = useState<AtsScore | null>(initialScore);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const report = score?.reportData as AtsReportData | undefined;

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await atsService.analyze(resumeId);
      setScore(result.atsScore);
      toast({ title: "Analysis complete", description: `ATS Score: ${result.atsScore.score}/100`, variant: "success" });
    } catch (error) {
      toast({ title: "Analysis failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!score) return;
    try {
      await atsService.downloadReport(score.id);
      toast({ title: "Report downloaded", variant: "success" });
    } catch (error) {
      toast({ title: "Download failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <PageTransition className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/resume/${resumeId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              ATS Analysis
            </h1>
            <p className="text-sm text-muted-foreground">{resumeTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAnalysis} isLoading={isAnalyzing} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {score ? "Re-analyze" : "Run Analysis"}
          </Button>
          {score && (
            <Button variant="gradient" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {!score ? (
        <Card>
          <CardContent className="py-20 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold mb-2">No ATS analysis yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Run an ATS check to analyze keywords, sections, formatting, and get a compatibility score.
            </p>
            <Button variant="gradient" size="lg" onClick={runAnalysis} isLoading={isAnalyzing}>
              Analyze Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <ScoreRing score={score.score} />
              <h2 className="text-lg font-semibold mt-4">ATS Compatibility</h2>
              <ScoreBadge score={score.score} />
              <p className="text-xs text-muted-foreground mt-2">
                Analyzed {new Date(score.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {report &&
                Object.entries(report.breakdown).map(([key, val]) => (
                  <BreakdownBar
                    key={key}
                    label={key}
                    score={val.score}
                    max={val.max}
                    feedback={val.feedback}
                  />
                ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Detected Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(report?.detectedSkills ?? score.keywords ?? []).map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))}
                {!(report?.detectedSkills?.length || score.keywords?.length) && (
                  <p className="text-sm text-muted-foreground">No skills detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Missing Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(score.missingKeywords ?? []).map((kw) => (
                  <Badge key={kw} variant="warning">{kw}</Badge>
                ))}
                {!score.missingKeywords?.length && (
                  <p className="text-sm text-muted-foreground">Great keyword coverage!</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(score.suggestions ?? []).map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Improvement Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                {(score.improvementTips ?? []).map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {(score.grammarIssues?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Grammar & Style</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {score.grammarIssues!.map((issue, i) => (
                    <li key={i} className="flex gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(score.formattingIssues?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formatting Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {score.formattingIssues!.map((issue, i) => (
                    <li key={i} className="flex gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageTransition>
  );
}

export function AtsReportSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
      </div>
    </div>
  );
}
