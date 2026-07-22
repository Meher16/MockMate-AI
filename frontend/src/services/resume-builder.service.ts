import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { Resume } from "@/types/resume";
import type { ResumeBuilderData } from "@/types/resume-builder";

export const resumeBuilderService = {
  async create(title: string, builderData: ResumeBuilderData): Promise<Resume> {
    const res = await api.post<ApiResponse<{ resume: Resume }>>("/resumes/builder", {
      title,
      builderData,
    });
    return res.data.data!.resume;
  },

  async update(id: string, title: string, builderData: ResumeBuilderData): Promise<Resume> {
    const res = await api.put<ApiResponse<{ resume: Resume }>>(`/resumes/${id}/builder`, {
      title,
      builderData,
    });
    return res.data.data!.resume;
  },

  async exportPdf(id: string): Promise<void> {
    const res = await api.get(`/resumes/${id}/export/pdf`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  async exportHtml(id: string): Promise<void> {
    const res = await api.get(`/resumes/${id}/export/html`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${id}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
