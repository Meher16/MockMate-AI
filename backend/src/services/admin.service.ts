import prisma from '../config/database';
import { average } from '../utils/analytics.utils';
import { DOMAIN_LABELS } from './ai/llm.types';

export interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  averageScore: number | null;
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
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  }>;
  recentInterviews: Array<{
    id: string;
    createdAt: Date;
    domain: string | null;
    difficulty: string;
    status: string;
    overallScore: number | null;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export class AdminService {
  async getStats(): Promise<AdminStats> {
    const [totalUsers, totalInterviews, completedInterviews, recentUsers, recentInterviews] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.interview.count(),
      prisma.interview.findMany({
        where: { status: 'COMPLETED' },
        include: {
          feedback: {
            select: { overallScore: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
      prisma.interview.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          feedback: {
            select: { overallScore: true },
          },
        },
      }),
    ]);

    const completedScores = completedInterviews
      .filter((i) => i.feedback?.overallScore != null)
      .map((i) => i.feedback!.overallScore);

    const averageScore = average(completedScores);

    // Domain Breakdown
    const allInterviews = await prisma.interview.findMany({
      include: {
        feedback: { select: { overallScore: true } },
      },
    });

    const domainMap = new Map<string, { count: number; scores: number[] }>();
    for (const i of allInterviews) {
      const key = i.domain ?? 'GENERAL';
      const entry = domainMap.get(key) ?? { count: 0, scores: [] };
      entry.count++;
      if (i.feedback?.overallScore != null) {
        entry.scores.push(i.feedback.overallScore);
      }
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

    // Difficulty Breakdown
    const diffMap = new Map<string, { count: number; scores: number[] }>();
    for (const i of allInterviews) {
      const entry = diffMap.get(i.difficulty) ?? { count: 0, scores: [] };
      entry.count++;
      if (i.feedback?.overallScore != null) {
        entry.scores.push(i.feedback.overallScore);
      }
      diffMap.set(i.difficulty, entry);
    }

    const difficultyBreakdown = Array.from(diffMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      avgScore: average(data.scores),
    }));

    return {
      totalUsers,
      totalInterviews,
      averageScore,
      domainBreakdown,
      difficultyBreakdown,
      recentUsers,
      recentInterviews: recentInterviews.map((i) => ({
        id: i.id,
        createdAt: i.createdAt,
        domain: i.domain,
        difficulty: i.difficulty,
        status: i.status,
        overallScore: i.feedback?.overallScore ?? null,
        user: i.user,
      })),
    };
  }

  async getUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            interviews: true,
            resumes: true,
          },
        },
      },
    });
  }

  async deleteUser(userId: string, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new Error('Cannot delete your own admin account');
    }

    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async getInterviews() {
    const interviews = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        feedback: {
          select: {
            overallScore: true,
          },
        },
      },
    });

    return interviews.map((i) => ({
      id: i.id,
      domain: i.domain,
      difficulty: i.difficulty,
      status: i.status,
      questionCount: i.questionCount,
      createdAt: i.createdAt,
      user: i.user,
      overallScore: i.feedback?.overallScore ?? null,
    }));
  }
}

export const adminService = new AdminService();
