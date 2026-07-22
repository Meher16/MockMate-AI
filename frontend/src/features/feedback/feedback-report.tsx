"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BookOpen,
  MessageSquare,
  Camera,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ScoreBadge } from "@/components/ui/badge";
import { PageTransition, Skeleton } from "@/components/ui/motion";
import { feedbackService } from "@/services/feedback.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";
import type { FeedbackDetail, InterviewFeedback } from "@/types/feedback";
import { SCORE_CATEGORIES } from "@/types/feedback";
import { getDomainLabel, getDifficultyColor } from "@/types/interview";
import { cn } from "@/utils/cn";

interface FeedbackReportProps {
  interviewId: string;
}

function ScoreRing({ score }: { score: number }) {
  const rounded = Math.round(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rounded / 100) * circumference;
  const color =
    rounded >= 80 ? "stroke-emerald-500" : rounded >= 60 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
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
        <div className="text-4xl font-bold">{rounded}</div>
        <div className="text-xs text-muted-foreground">Overall %</div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const rounded = Math.round(score);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{rounded}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            rounded >= 80 ? "bg-emerald-500" : rounded >= 60 ? "bg-amber-500" : "bg-red-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${rounded}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function normalizeFeedback(data: FeedbackDetail["feedback"]): InterviewFeedback {
  return {
    ...data,
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    topicsToImprove: Array.isArray(data.topicsToImprove) ? data.topicsToImprove : [],
    learningResources: Array.isArray(data.learningResources) ? data.learningResources : [],
  };
}

export function FeedbackReport({ interviewId }: FeedbackReportProps) {
  const [data, setData] = useState<FeedbackDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState<"html" | "pdf" | null>(null);
  const { toast } = useToast();

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const result = await feedbackService.get(interviewId);
      setData(result);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setData(null);
      } else {
        toast({ title: "Failed to load feedback", description: getErrorMessage(error), variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await feedbackService.generate(interviewId);
      await loadFeedback();
      toast({ title: "Feedback generated", description: "Your performance report is ready." });
    } catch (error) {
      toast({ title: "Generation failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: "html" | "pdf") => {
    setIsDownloading(format);
    try {
      if (format === "html") {
        await feedbackService.downloadHtmlReport(interviewId);
      } else {
        await feedbackService.downloadPdfReport(interviewId);
      }
    } catch (error) {
      toast({ title: "Download failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <PageTransition className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </PageTransition>
    );
  }

  if (!data) {
    return (
      <PageTransition className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4 opacity-70" />
        <h1 className="text-2xl font-bold mb-2">Feedback Not Ready</h1>
        <p className="text-muted-foreground mb-6">
          Generate a detailed performance report with scores, strengths, and learning resources.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/interview/${interviewId}`}>
            <Button variant="outline">Back to Interview</Button>
          </Link>
          <Button variant="gradient" onClick={handleGenerate} isLoading={isGenerating}>
            Generate Feedback
          </Button>
        </div>
      </PageTransition>
    );
  }

  const feedback = normalizeFeedback(data.feedback);
  const interview = data.interview;
  const questions = interview.questions ?? [];

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/interview">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Interview Feedback</h1>
            <p className="text-sm text-muted-foreground">
              {getDomainLabel(interview.domain)} · {interview.difficulty} · {questions.length} questions
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => handleDownload("html")}
            disabled={isDownloading !== null}
          >
            {isDownloading === "html" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading !== null}
          >
            {isDownloading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-strong">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <ScoreRing score={feedback.overallScore} />
            <p className="mt-4 text-muted-foreground max-w-sm">{feedback.performanceSummary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SCORE_CATEGORIES.map(({ key, label }) => (
              <ScoreBar key={key} label={label} score={feedback[key] as number} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
              <TrendingDown className="h-5 w-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {feedback.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500 shrink-0">→</span>
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {feedback.topicsToImprove.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topics to Review</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {feedback.topicsToImprove.map((topic, i) => (
              <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                {topic}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {feedback.learningResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {feedback.learningResources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors"
              >
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.type}</p>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {feedback.cameraMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5 text-accent" />
              Camera Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Avg. Eye Contact</p>
              <p className="text-2xl font-bold">{feedback.cameraMetrics.avgEyeContact}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Head Stability</p>
              <p className="text-2xl font-bold">{feedback.cameraMetrics.avgHeadStability}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Questions Monitored</p>
              <p className="text-2xl font-bold">{feedback.cameraMetrics.questionsWithCamera}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Q&amp;A Replay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                {q.category && <Badge variant="secondary">{q.category}</Badge>}
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getDifficultyColor(q.difficulty))}>
                  {q.difficulty}
                </span>
                {q.answer?.score != null && (
                  <div className="ml-auto">
                    <ScoreBadge score={q.answer.score * 10} />
                  </div>
                )}
              </div>
              <p className="font-medium text-sm">{q.questionText}</p>
              {q.answer && (
                <>
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                    {q.answer.answerText}
                  </p>
                  {q.answer.analysis?.feedback && (
                    <p className="text-xs text-muted-foreground italic">{q.answer.analysis.feedback}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
