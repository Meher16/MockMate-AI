"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/cn";
import type { Interview } from "@/types/interview";
import { getDomainLabel, getStatusLabel } from "@/types/interview";

interface InterviewHistoryProps {
  interviews: Interview[];
}

function statusVariant(status: Interview["status"]): "success" | "warning" | "secondary" | "destructive" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "warning";
  if (status === "CANCELLED") return "destructive";
  return "secondary";
}

export function InterviewHistory({ interviews }: InterviewHistoryProps) {
  if (interviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No interviews yet</p>
          <p className="text-sm mt-1">Configure and start your first mock interview above</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview, i) => {
        return (
          <motion.div
            key={interview.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium">{getDomainLabel(interview.domain)}</span>
                    <Badge variant={statusVariant(interview.status)}>{getStatusLabel(interview.status)}</Badge>
                    <Badge variant="secondary">{interview.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {interview.questionCount} questions · {interview.durationMinutes} min
                    {interview.resume && ` · Resume: ${interview.resume.title}`}
                    {" · "}{formatDate(interview.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {interview.feedback?.overallScore != null && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      {interview.feedback.overallScore}%
                    </div>
                  )}
                  {interview.status === "IN_PROGRESS" || interview.status === "PENDING" ? (
                    <Link href={`/interview/${interview.id}`}>
                      <Button variant="gradient" size="sm" className="gap-1">
                        <Play className="h-3.5 w-3.5" />
                        {interview.status === "IN_PROGRESS" ? "Continue" : "Start"}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/interview/${interview.id}/feedback`}>
                      <Button variant="outline" size="sm">View Feedback</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
