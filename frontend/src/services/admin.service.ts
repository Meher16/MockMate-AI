import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";

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
    createdAt: string;
  }>;
  recentInterviews: Array<{
    id: string;
    createdAt: string;
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

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  _count: {
    interviews: number;
    resumes: number;
  };
}

export interface AdminInterview {
  id: string;
  domain: string | null;
  difficulty: string;
  status: string;
  questionCount: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  overallScore: number | null;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return res.data.data!;
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get<ApiResponse<AdminUser[]>>("/admin/users");
    return res.data.data!;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/admin/users/${id}`);
  },

  async getInterviews(): Promise<AdminInterview[]> {
    const res = await api.get<ApiResponse<AdminInterview[]>>("/admin/interviews");
    return res.data.data!;
  },
};
