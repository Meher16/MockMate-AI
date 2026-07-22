import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { FeedbackDetail, InterviewFeedback } from "@/types/feedback";

export const feedbackService = {
  async generate(interviewId: string): Promise<InterviewFeedback> {
    const res = await api.post<ApiResponse<{ feedback: InterviewFeedback }>>(
      `/interviews/${interviewId}/feedback/generate`
    );
    return res.data.data!.feedback;
  },

  async get(interviewId: string): Promise<FeedbackDetail> {
    const res = await api.get<ApiResponse<FeedbackDetail>>(`/interviews/${interviewId}/feedback`);
    return res.data.data!;
  },

  async downloadHtmlReport(interviewId: string): Promise<void> {
    const res = await api.get(`/interviews/${interviewId}/feedback/report/html`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${interviewId}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  async downloadPdfReport(interviewId: string): Promise<void> {
    const res = await api.get(`/interviews/${interviewId}/feedback/report/pdf`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${interviewId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
