"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { AdminInterview } from "@/services/admin.service";
import { DOMAIN_LABELS } from "@/services/interview.service"; // Wait, check if DOMAIN_LABELS is exported there or define a local lookup

const DOMAIN_LOOKUP: Record<string, string> = {
  FRONTEND_DEVELOPER: "Frontend Developer",
  BACKEND_DEVELOPER: "Backend Developer",
  JAVA_DEVELOPER: "Java Developer",
  PYTHON_DEVELOPER: "Python Developer",
  MERN_STACK: "MERN Stack",
  DATA_SCIENCE: "Data Science",
  MACHINE_LEARNING: "Machine Learning",
  DEVOPS: "DevOps",
  UI_UX: "UI/UX",
  HR: "HR / Behavioral",
  MARKETING: "Marketing",
};

interface AdminInterviewsProps {
  interviews: AdminInterview[];
}

export function AdminInterviews({ interviews }: AdminInterviewsProps) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = interviews.filter((i) => {
    const term = search.toLowerCase();
    const matchesSearch =
      i.user.firstName.toLowerCase().includes(term) ||
      i.user.lastName.toLowerCase().includes(term) ||
      i.user.email.toLowerCase().includes(term);

    const matchesDomain = domainFilter === "ALL" || i.domain === domainFilter;
    const matchesDifficulty = difficultyFilter === "ALL" || i.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;

    return matchesSearch && matchesDomain && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "MEDIUM":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "HARD":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "gradient";
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interviews by candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Domain Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Domain</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Domains</option>
              {Object.entries(DOMAIN_LOOKUP).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Difficulty</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <p className="text-sm text-muted-foreground ml-auto self-end">
            Showing {filtered.length} of {interviews.length} sessions
          </p>
        </div>
      </div>

      {/* Interviews List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="py-12 text-center text-muted-foreground">
              No interviews found matching your filter options.
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="glass hover:bg-card/50 transition-colors duration-150">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-base">{item.user.firstName} {item.user.lastName}</span>
                    <span className="text-xs text-muted-foreground">({item.user.email})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {item.domain ? DOMAIN_LOOKUP[item.domain] || item.domain.replace(/_/g, ' ') : "General"}
                    </Badge>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {item.questionCount} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                    <Calendar className="h-3.5 w-3.5" /> Created: {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end">
                      <Badge variant={getStatusColor(item.status)} className="capitalize text-xs">
                        {item.status.toLowerCase().replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {item.status === "COMPLETED" && item.overallScore != null && (
                      <div className="flex items-center gap-1 text-emerald-500 font-semibold justify-end text-sm">
                        <CheckCircle className="h-4 w-4" /> {Math.round(item.overallScore)}% Score
                      </div>
                    )}
                  </div>

                  {item.status === "COMPLETED" && (
                    <Link href={`/interview/${item.id}/feedback`}>
                      <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
