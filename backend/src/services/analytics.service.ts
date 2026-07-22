import prisma from '../config/database';
import { average, computeScoreChange } from '../utils/analytics.utils';
import { DOMAIN_LABELS } from './ai/llm.types';

const RECENT_INTERVIEW_LIMIT = 5;
const ATS_TREND_LIMIT = 12;

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
    createdAt: Date;
    completedAt: Date | null;
    feedback: { overallScore: number } | null;
  }>;
}

export class AnalyticsService {
  async getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [interviews, atsScores, resumeCount, answeredCount] = await Promise.all([
      prisma.interview.findMany({
        where: { userId },
        include: {
          feedback: {
            select: {
              overallScore: true,
              technicalScore: true,
              communicationScore: true,
              confidenceScore: true,
              problemSolvingScore: true,
              resumeMatchScore: true,
              behavioralScore: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.atsScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { score: true, createdAt: true },
        take: ATS_TREND_LIMIT,
      }),
      prisma.resume.count({ where: { userId } }),
      prisma.answer.count({
        where: { question: { interview: { userId } } },
      }),
    ]);

    const completed = interviews.filter((i) => i.status === 'COMPLETED');
    const withFeedback = completed.filter((i) => i.feedback);
    const scores = withFeedback.map((i) => i.feedback!.overallScore);

    const interviewsThisMonth = interviews.filter((i) => i.createdAt >= monthStart).length;

    const scoreChange = computeScoreChange(scores.slice(-3), scores.slice(-6, -3));

    const scoreTrend = withFeedback.map((i) => ({
      date: (i.completedAt ?? i.createdAt).toISOString(),
      score: Math.round(i.feedback!.overallScore),
      interviewId: i.id,
      domain: i.domain ?? 'GENERAL',
      domainLabel: DOMAIN_LABELS[i.domain ?? ''] ?? i.domain ?? 'General',
    }));

    const feedbackList = withFeedback.map((i) => i.feedback!);
    const skillRadar =
      feedbackList.length > 0
        ? {
            technical: Math.round(average(feedbackList.map((f) => f.technicalScore)) ?? 0),
            communication: Math.round(average(feedbackList.map((f) => f.communicationScore)) ?? 0),
            confidence: Math.round(average(feedbackList.map((f) => f.confidenceScore)) ?? 0),
            problemSolving: Math.round(average(feedbackList.map((f) => f.problemSolvingScore)) ?? 0),
            resumeMatch: Math.round(average(feedbackList.map((f) => f.resumeMatchScore)) ?? 0),
            behavioral: Math.round(average(feedbackList.map((f) => f.behavioralScore)) ?? 0),
          }
        : null;

    const domainMap = new Map<string, { count: number; scores: number[] }>();
    for (const i of interviews) {
      const key = i.domain ?? 'GENERAL';
      const entry = domainMap.get(key) ?? { count: 0, scores: [] };
      entry.count++;
      if (i.feedback?.overallScore != null) entry.scores.push(i.feedback.overallScore);
      domainMap.set(key, entry);
    }

    const domainBreakdown = Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        domainLabel: DOMAIN_LABELS[domain] ?? domain.replace(/_/g, ' '),
        count: data.count,
        avgScore: average(data.scores),
      }))
      .sort((a, b) => b.count - a.count);

    const diffMap = new Map<string, { count: number; scores: number[] }>();
    for (const i of interviews) {
      const entry = diffMap.get(i.difficulty) ?? { count: 0, scores: [] };
      entry.count++;
      if (i.feedback?.overallScore != null) entry.scores.push(i.feedback.overallScore);
      diffMap.set(i.difficulty, entry);
    }

    const difficultyBreakdown = Array.from(diffMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      avgScore: average(data.scores),
    }));

    const statusBreakdown = {
      pending: interviews.filter((i) => i.status === 'PENDING').length,
      inProgress: interviews.filter((i) => i.status === 'IN_PROGRESS').length,
      completed: completed.length,
      cancelled: interviews.filter((i) => i.status === 'CANCELLED').length,
    };

    const atsTrend = atsScores.map((a) => ({
      date: a.createdAt.toISOString(),
      score: a.score,
    }));

    const latestAts = atsScores.length ? atsScores[atsScores.length - 1].score : null;

    return {
      overview: {
        totalInterviews: interviews.length,
        completedInterviews: completed.length,
        averageScore: average(scores),
        bestScore: scores.length ? Math.max(...scores) : null,
        interviewsThisMonth,
        scoreChange,
        totalQuestionsAnswered: answeredCount,
        resumeCount,
        atsScore: latestAts,
      },
      scoreTrend,
      skillRadar,
      domainBreakdown,
      difficultyBreakdown,
      statusBreakdown,
      atsTrend,
      recentInterviews: [...interviews]
        .reverse()
        .slice(0, RECENT_INTERVIEW_LIMIT)
        .map((i) => ({
          id: i.id,
          domain: i.domain,
          difficulty: i.difficulty,
          status: i.status,
          questionCount: i.questionCount,
          createdAt: i.createdAt,
          completedAt: i.completedAt,
          feedback: i.feedback ? { overallScore: i.feedback.overallScore } : null,
        })),
    };
  }
}

export const analyticsService = new AnalyticsService();
