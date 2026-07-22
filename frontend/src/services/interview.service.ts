import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type {
  Interview,
  CreateInterviewInput,
  Question,
  AnswerAnalysis,
  Answer,
  InterviewStats,
} from "@/types/interview";

export const interviewService = {
  async create(input: CreateInterviewInput): Promise<Interview> {
    const res = await api.post<ApiResponse<{ interview: Interview }>>("/interviews", input);
    return res.data.data!.interview;
  },

  async list(): Promise<Interview[]> {
    const res = await api.get<ApiResponse<{ interviews: Interview[] }>>("/interviews");
    return res.data.data!.interviews;
  },

  async get(id: string): Promise<Interview> {
    const res = await api.get<ApiResponse<{ interview: Interview }>>(`/interviews/${id}`);
    return res.data.data!.interview;
  },

  async start(id: string): Promise<{ interview: Interview; currentQuestion: Question | null }> {
    const res = await api.post<ApiResponse<{ interview: Interview; currentQuestion: Question | null }>>(
      `/interviews/${id}/start`
    );
    return res.data.data!;
  },

  async getCurrent(id: string): Promise<{
    interview: Interview;
    currentQuestion: Question | null;
    answeredCount: number;
    totalQuestions: number;
    isComplete: boolean;
  }> {
    const res = await api.get<ApiResponse<{
      interview: Interview;
      currentQuestion: Question | null;
      answeredCount: number;
      totalQuestions: number;
      isComplete: boolean;
    }>>(`/interviews/${id}/current`);
    return res.data.data!;
  },

  async submitAnswer(
    interviewId: string,
    questionId: string,
    answerText: string,
    timeTakenSec?: number,
    transcription?: string,
    cameraMetrics?: {
      samples: number;
      avgEyeContact: number;
      lookingAwayCount: number;
      multipleFacesCount: number;
      avgFaceVisibility: number;
      avgHeadStability: number;
    }
  ): Promise<{
    answer: Answer;
    analysis: AnswerAnalysis;
    nextQuestion: Question | null;
    answeredCount: number;
    totalQuestions: number;
    isComplete: boolean;
    adjustedDifficulty: string;
  }> {
    const res = await api.post<ApiResponse<{
      answer: Answer;
      analysis: AnswerAnalysis;
      nextQuestion: Question | null;
      answeredCount: number;
      totalQuestions: number;
      isComplete: boolean;
      adjustedDifficulty: string;
    }>>(`/interviews/${interviewId}/questions/${questionId}/answer`, {
      answerText,
      timeTakenSec,
      transcription,
      cameraMetrics,
    });
    return res.data.data!;
  },

  async cancel(id: string): Promise<void> {
    await api.post(`/interviews/${id}/cancel`);
  },

  async getStats(): Promise<InterviewStats> {
    const res = await api.get<ApiResponse<{ stats: InterviewStats }>>("/interviews/stats");
    return res.data.data!.stats;
  },
};
