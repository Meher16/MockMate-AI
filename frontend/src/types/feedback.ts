import type { Interview, Question } from "./interview";

export interface LearningResource {
  title: string;
  url: string;
  type: string;
}

export interface CameraMetricsSummary {
  avgEyeContact: number;
  avgHeadStability: number;
  totalLookingAway: number;
  totalMultipleFaces: number;
  questionsWithCamera: number;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  resumeMatchScore: number;
  behavioralScore: number;
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningResources: LearningResource[];
  performanceSummary?: string | null;
  cameraMetrics?: CameraMetricsSummary | null;
  reportData?: {
    perQuestionScores?: Array<{
      questionId: string;
      question: string;
      score: number;
      category?: string | null;
    }>;
  } | null;
  createdAt: string;
}

export interface FeedbackDetail {
  interview: Interview & { questions?: Question[] };
  feedback: InterviewFeedback;
}

export const SCORE_CATEGORIES: Array<{ key: keyof InterviewFeedback; label: string }> = [
  { key: "technicalScore", label: "Technical" },
  { key: "communicationScore", label: "Communication" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "problemSolvingScore", label: "Problem Solving" },
  { key: "resumeMatchScore", label: "Resume Match" },
  { key: "behavioralScore", label: "Behavioral" },
];
