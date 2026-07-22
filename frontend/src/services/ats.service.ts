import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { AtsScore } from "@/types/resume";

export const atsService = {
  async analyze(resumeId: string): Promise<{ atsScore: AtsScore; analysis: unknown }> {
    const res = await api.post<ApiResponse<{ atsScore: AtsScore; analysis: unknown }>>(
      `/ats/analyze/${resumeId}`
    );
    return res.data.data!;
  },

  async list(): Promise<AtsScore[]> {
    const res = await api.get<ApiResponse<{ scores: AtsScore[] }>>("/ats");
    return res.data.data!.scores;
  },

  async get(id: string): Promise<AtsScore> {
    const res = await api.get<ApiResponse<{ score: AtsScore }>>(`/ats/${id}`);
    return res.data.data!.score;
  },

  async getLatestForResume(resumeId: string): Promise<AtsScore | null> {
    const res = await api.get<ApiResponse<{ score: AtsScore | null }>>(
      `/ats/resume/${resumeId}/latest`
    );
    return res.data.data!.score;
  },

  async downloadReport(scoreId: string): Promise<void> {
    const res = await api.get(`/ats/${scoreId}/report`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ats-report-${scoreId}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
