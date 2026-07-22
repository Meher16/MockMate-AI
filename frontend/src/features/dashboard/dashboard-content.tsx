"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  Clock,
  Star,
  Play,
  TrendingUp,
  TrendingDown,
  Target,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, ScoreBadge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { PageTransition, StatCardSkeleton } from "@/components/ui/motion";
import { resumeService } from "@/services/resume.service";
import { analyticsService } from "@/services/analytics.service";
import type { DashboardStats } from "@/types/resume";
import type { DashboardAnalytics } from "@/types/analytics";
import { getDomainLabel } from "@/types/interview";
import { cn } from "@/utils/cn";

const ScoreTrendChart = dynamic(
  () => import("@/features/dashboard/score-trend-chart").then((m) => ({ default: m.ScoreTrendChart })),
  { loading: () => <ChartPlaceholder /> }
);

const SkillRadarChart = dynamic(
  () => import("@/features/dashboard/skill-radar-chart").then((m) => ({ default: m.SkillRadarChart })),
  { loading: () => <ChartPlaceholder /> }
);

const DomainBreakdownChart = dynamic(
  () => import("@/features/dashboard/analytics-charts").then((m) => ({ default: m.DomainBreakdownChart })),
  { loading: () => <ChartPlaceholder /> }
);

const DifficultyBreakdownChart = dynamic(
  () => import("@/features/dashboard/analytics-charts").then((m) => ({ default: m.DifficultyBreakdownChart })),
  { loading: () => <ChartPlaceholder /> }
);

const AtsTrendChart = dynamic(
  () => import("@/features/dashboard/analytics-charts").then((m) => ({ default: m.AtsTrendChart })),
  { loading: () => <ChartPlaceholder /> }
);

function ChartPlaceholder() {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
      <p className="text-sm text-muted-foreground">Loading chart...</p>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function DashboardContent() {
  const { user } = useAuth();
  const [resumeStats, setResumeStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([resumeService.getStats(), analyticsService.getDashboard()])
      .then(([resume, data]) => {
        setResumeStats(resume);
        setAnalytics(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const overview = analytics?.overview;

  const statCards = [
    {
      title: "Resume Status",
      value:
        resumeStats?.resumeStatus === "none"
          ? "Not uploaded"
          : resumeStats?.resumeStatus === "built"
            ? "Built"
            : `${resumeStats?.resumeCount ?? 0} resume(s)`,
      description: resumeStats?.primaryResume?.title ?? "Upload or build your resume",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      href: "/resume",
    },
    {
      title: "ATS Score",
      value: overview?.atsScore != null ? `${overview.atsScore}/100` : "—",
      description: overview?.atsScore != null ? "Latest analysis score" : "Analyze your resume",
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
      href: resumeStats?.primaryResume ? `/resume/${resumeStats.primaryResume.id}/ats` : "/resume",
    },
    {
      title: "Interviews",
      value: String(overview?.completedInterviews ?? 0),
      description: `${overview?.totalInterviews ?? 0} total · ${overview?.interviewsThisMonth ?? 0} this month`,
      icon: Clock,
      color: "from-orange-500 to-amber-500",
      href: "/interview",
    },
    {
      title: "Avg. Score",
      value: overview?.averageScore != null ? `${Math.round(overview.averageScore)}%` : "—",
      description:
        overview?.bestScore != null
          ? `Best: ${Math.round(overview.bestScore)}%`
          : "Across completed interviews",
      icon: Star,
      color: "from-emerald-500 to-teal-500",
      href: "/interview",
      extra:
        overview?.scoreChange != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium ml-1",
              overview.scoreChange >= 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {overview.scoreChange >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {overview.scoreChange >= 0 ? "+" : ""}
            {overview.scoreChange}%
          </span>
        ) : null,
    },
  ];

  return (
    <PageTransition className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and identify areas to improve.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/resume">
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="h-4 w-4" />
              Manage Resume
            </Button>
          </Link>
          <Link href="/interview">
            <Button variant="gradient" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Interview
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat) => (
            <motion.div key={stat.title} variants={item}>
              <Link href={stat.href}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-md`}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {stat.title === "ATS Score" && overview?.atsScore != null ? (
                        <ScoreBadge score={overview.atsScore} />
                      ) : (
                        <>
                          {stat.value}
                          {stat.extra}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && analytics && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Interview Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreTrendChart data={analytics.scoreTrend} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Skill Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.skillRadar ? (
                  <SkillRadarChart data={analytics.skillRadar} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
                    <Target className="h-10 w-10 mb-3 opacity-30" />
                    Complete interviews with feedback to see your skill profile
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  By Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DomainBreakdownChart data={analytics.domainBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-accent" />
                  By Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DifficultyBreakdownChart data={analytics.difficultyBreakdown} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-accent" />
                  ATS Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AtsTrendChart data={analytics.atsTrend} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentInterviews.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.recentInterviews.map((iv) => (
                      <Link
                        key={iv.id}
                        href={
                          iv.status === "COMPLETED"
                            ? `/interview/${iv.id}/feedback`
                            : `/interview/${iv.id}`
                        }
                      >
                        <div className="rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-medium truncate">
                                {getDomainLabel(iv.domain as Parameters<typeof getDomainLabel>[0])}
                              </p>
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                {iv.difficulty}
                              </Badge>
                            </div>
                            {iv.feedback?.overallScore != null && (
                              <span className="text-xs font-medium text-emerald-600 shrink-0">
                                {Math.round(iv.feedback.overallScore)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {iv.status.replace(/_/g, " ")} · {iv.questionCount} questions
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mb-4 opacity-30" />
                    <p className="font-medium">No interviews yet</p>
                    <p className="text-sm mt-1">Start your first mock interview to see history here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Activity Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Questions answered</span>
                    <span className="text-xl font-bold">{overview?.totalQuestionsAnswered ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed sessions</span>
                    <span className="text-xl font-bold">{overview?.completedInterviews ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Resumes uploaded</span>
                    <span className="text-xl font-bold">{overview?.resumeCount ?? 0}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Session status</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-secondary/50 p-2 text-center">
                        <p className="font-bold text-lg">{analytics.statusBreakdown.completed}</p>
                        <p className="text-muted-foreground">Completed</p>
                      </div>
                      <div className="rounded-md bg-secondary/50 p-2 text-center">
                        <p className="font-bold text-lg">{analytics.statusBreakdown.inProgress}</p>
                        <p className="text-muted-foreground">In Progress</p>
                      </div>
                      <div className="rounded-md bg-secondary/50 p-2 text-center">
                        <p className="font-bold text-lg">{analytics.statusBreakdown.pending}</p>
                        <p className="text-muted-foreground">Pending</p>
                      </div>
                      <div className="rounded-md bg-secondary/50 p-2 text-center">
                        <p className="font-bold text-lg">{analytics.statusBreakdown.cancelled}</p>
                        <p className="text-muted-foreground">Cancelled</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/resume/builder">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Build a new resume
                    </Button>
                  </Link>
                  <Link href="/interview">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Play className="h-4 w-4" />
                      Start a mock interview
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
}
