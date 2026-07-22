import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { DashboardAnalytics } from "@/types/analytics";

export const analyticsService = {
  async getDashboard(): Promise<DashboardAnalytics> {
    const res = await api.get<ApiResponse<{ analytics: DashboardAnalytics }>>("/analytics/dashboard");
    return res.data.data!.analytics;
  },
};
