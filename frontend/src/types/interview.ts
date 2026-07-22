export type InterviewDomain =
  | "FRONTEND_DEVELOPER"
  | "BACKEND_DEVELOPER"
  | "JAVA_DEVELOPER"
  | "PYTHON_DEVELOPER"
  | "MERN_STACK"
  | "DATA_SCIENCE"
  | "MACHINE_LEARNING"
  | "DEVOPS"
  | "UI_UX"
  | "HR"
  | "MARKETING";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type InterviewStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export const DOMAIN_OPTIONS: { value: InterviewDomain; label: string }[] = [
  { value: "FRONTEND_DEVELOPER", label: "Frontend Developer" },
  { value: "BACKEND_DEVELOPER", label: "Backend Developer" },
  { value: "JAVA_DEVELOPER", label: "Java Developer" },
  { value: "PYTHON_DEVELOPER", label: "Python Developer" },
  { value: "MERN_STACK", label: "MERN Stack" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "MACHINE_LEARNING", label: "Machine Learning" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "UI_UX", label: "UI/UX" },
  { value: "HR", label: "HR / Behavioral" },
  { value: "MARKETING", label: "Marketing" },
];

export const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: "EASY", label: "Easy", description: "Fundamentals and basic concepts" },
  { value: "MEDIUM", label: "Medium", description: "Intermediate practical questions" },
  { value: "HARD", label: "Hard", description: "Advanced and system design" },
];

export const DURATION_OPTIONS = [
  { value: 10, label: "10 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes (custom)" },
];

export const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: "5 questions" },
  { value: 10, label: "10 questions" },
  { value: 15, label: "15 questions" },
  { value: 20, label: "20 questions (custom)" },
];

export interface Question {
  id: string;
  interviewId: string;
  orderIndex: number;
  questionText: string;
  category?: string | null;
  difficulty: DifficultyLevel;
  createdAt: string;
  answer?: Answer | null;
}

export interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  transcription?: string | null;
  score?: number | null;
  analysis?: AnswerAnalysis | null;
  timeTakenSec?: number | null;
  createdAt: string;
}

export interface AnswerAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedDifficulty: DifficultyLevel;
}

export interface Interview {
  id: string;
  userId: string;
  resumeId?: string | null;
  domain?: InterviewDomain | null;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questionCount: number;
  status: InterviewStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  resume?: { id: string; title: string; rawText?: string | null } | null;
  questions?: Question[];
  feedback?: { overallScore: number } | null;
}

export interface CreateInterviewInput {
  resumeId?: string;
  domain: InterviewDomain;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questionCount: number;
}

export interface InterviewStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number | null;
  recentInterviews: Interview[];
}

export function getDomainLabel(domain?: InterviewDomain | null): string {
  return DOMAIN_OPTIONS.find((d) => d.value === domain)?.label ?? domain ?? "General";
}

export function getDifficultyColor(d: DifficultyLevel): string {
  if (d === "EASY") return "text-emerald-600 bg-emerald-500/15";
  if (d === "HARD") return "text-red-600 bg-red-500/15";
  return "text-amber-600 bg-amber-500/15";
}

export function getStatusLabel(s: InterviewStatus): string {
  const map: Record<InterviewStatus, string> = {
    PENDING: "Ready",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return map[s];
}
