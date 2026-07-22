export interface DashboardAnalytics {
  overview: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number | null;
    bestScore: number | null;
    interviewsThisMonth: number;
    scoreChange: number | null;
    totalQuestionsAnswered: number;
    resumeCount: number;
    atsScore: number | null;
  };
  scoreTrend: Array<{
    date: string;
    score: number;
    interviewId: string;
    domain: string;
    domainLabel: string;
  }>;
  skillRadar: {
    technical: number;
    communication: number;
    confidence: number;
    problemSolving: number;
    resumeMatch: number;
    behavioral: number;
  } | null;
  domainBreakdown: Array<{
    domain: string;
    domainLabel: string;
    count: number;
    avgScore: number | null;
  }>;
  difficultyBreakdown: Array<{
    difficulty: string;
    count: number;
    avgScore: number | null;
  }>;
  statusBreakdown: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  atsTrend: Array<{ date: string; score: number }>;
  recentInterviews: Array<{
    id: string;
    domain: string | null;
    difficulty: string;
    status: string;
    questionCount: number;
    createdAt: string;
    completedAt: string | null;
    feedback: { overallScore: number } | null;
  }>;
}

export const SKILL_LABELS: Record<keyof NonNullable<DashboardAnalytics["skillRadar"]>, string> = {
  technical: "Technical",
  communication: "Communication",
  confidence: "Confidence",
  problemSolving: "Problem Solving",
  resumeMatch: "Resume Match",
  behavioral: "Behavioral",
};
