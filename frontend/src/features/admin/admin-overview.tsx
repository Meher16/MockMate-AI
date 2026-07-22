"use client";

import { motion } from "framer-motion";
import { Users, FileText, Sparkles, Trophy, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AdminStats } from "@/services/admin.service";

interface AdminOverviewProps {
  stats: AdminStats;
  onViewTab: (tab: "users" | "interviews") => void;
}

export function AdminOverview({ stats, onViewTab }: AdminOverviewProps) {
  const averageScore = stats.averageScore != null ? Math.round(stats.averageScore) : null;

  // Let's compute completion rate or active details
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Candidates registered on the platform",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-500",
      clickAction: () => onViewTab("users"),
    },
    {
      title: "Total Interviews",
      value: stats.totalInterviews,
      description: "Mock interview sessions created",
      icon: FileText,
      color: "from-purple-500/20 to-pink-500/20 text-purple-500",
      clickAction: () => onViewTab("interviews"),
    },
    {
      title: "Average Score",
      value: averageScore != null ? `${averageScore}%` : "N/A",
      description: "Average overall score of completed sessions",
      icon: Sparkles,
      color: "from-amber-500/20 to-orange-500/20 text-amber-500",
    },
    {
      title: "Active Domains",
      value: stats.domainBreakdown.length,
      description: "Unique interview domains explored",
      icon: Trophy,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
    },
  ];

  // SVG Chart Dimensions
  const chartW = 320;
  const chartH = 150;

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={card.clickAction}
            className={card.clickAction ? "cursor-pointer" : ""}
          >
            <Card className="hover:scale-[1.02] transition-transform duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Domain Selection Breakdown */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Popular Domains
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.domainBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No domain activity yet</p>
            ) : (
              stats.domainBreakdown.map((db, i) => {
                const totalDomainCount = stats.domainBreakdown.reduce((sum, d) => sum + d.count, 0);
                const percent = totalDomainCount > 0 ? (db.count / totalDomainCount) * 100 : 0;
                return (
                  <div key={db.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{db.domainLabel}</span>
                      <span className="text-muted-foreground text-xs">
                        {db.count} sessions ({Math.round(percent)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <Badge variant={db.avgScore && db.avgScore >= 70 ? "success" : "secondary"} className="text-[10px]">
                        Avg: {db.avgScore != null ? `${Math.round(db.avgScore)}%` : "N/A"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Difficulty Breakdown (SVG Pie or Bar Chart) */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Difficulty Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[230px]">
            {stats.difficultyBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No difficulty details yet</p>
            ) : (
              <div className="flex flex-col gap-4 justify-center h-full">
                {stats.difficultyBreakdown.map((db) => {
                  const total = stats.difficultyBreakdown.reduce((sum, d) => sum + d.count, 0);
                  const percent = total > 0 ? (db.count / total) * 100 : 0;
                  const difficultyColors: Record<string, string> = {
                    EASY: "bg-emerald-500",
                    MEDIUM: "bg-amber-500",
                    HARD: "bg-rose-500",
                  };
                  return (
                    <div key={db.difficulty} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${difficultyColors[db.difficulty] || "bg-primary"}`} />
                          {db.difficulty}
                        </span>
                        <span className="text-muted-foreground text-xs">{db.count} times ({Math.round(percent)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full ${difficultyColors[db.difficulty] || "bg-primary"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Registered Users */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/30">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users registered yet</p>
            ) : (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Interviews Activity */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" /> Recent Interviews
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/30">
            {stats.recentInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No interview sessions created yet</p>
            ) : (
              stats.recentInterviews.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">
                      {session.user.firstName} {session.user.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{session.domain ? session.domain.replace(/_/g, ' ') : "General"}</span>
                      <span>•</span>
                      <span className="capitalize">{session.difficulty.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.status === "COMPLETED" ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle className="h-2.5 w-2.5" />
                        {session.overallScore != null ? `${Math.round(session.overallScore)}%` : "Done"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {session.status.toLowerCase().replace(/_/g, ' ')}
                      </Badge>
                    )}
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
