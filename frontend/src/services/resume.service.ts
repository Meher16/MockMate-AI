import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { Resume, DashboardStats } from "@/types/resume";

export const resumeService = {
  async list(): Promise<Resume[]> {
    const res = await api.get<ApiResponse<{ resumes: Resume[] }>>("/resumes");
    return res.data.data!.resumes;
  },

  async get(id: string): Promise<Resume> {
    const res = await api.get<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`);
    return res.data.data!.resume;
  },

  async upload(file: File, title?: string): Promise<Resume> {
    const formData = new FormData();
    formData.append("resume", file);
    if (title) formData.append("title", title);

    const res = await api.post<ApiResponse<{ resume: Resume }>>("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data!.resume;
  },

  async update(
    id: string,
    data: { title?: string; rawText?: string; isPrimary?: boolean }
  ): Promise<Resume> {
    const res = await api.put<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`, data);
    return res.data.data!.resume;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },

  async download(id: string): Promise<void> {
    const res = await api.get(`/resumes/${id}/download`, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  async getStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<{ stats: DashboardStats }>>("/resumes/stats");
    return res.data.data!.stats;
  },
};
