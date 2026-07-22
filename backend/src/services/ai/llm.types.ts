export const DOMAIN_LABELS: Record<string, string> = {
  FRONTEND_DEVELOPER: 'Frontend Developer',
  BACKEND_DEVELOPER: 'Backend Developer',
  JAVA_DEVELOPER: 'Java Developer',
  PYTHON_DEVELOPER: 'Python Developer',
  MERN_STACK: 'MERN Stack Developer',
  DATA_SCIENCE: 'Data Science',
  MACHINE_LEARNING: 'Machine Learning Engineer',
  DEVOPS: 'DevOps Engineer',
  UI_UX: 'UI/UX Designer',
  HR: 'HR / Behavioral',
  MARKETING: 'Marketing',
};

export interface GeneratedQuestion {
  questionText: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface AnswerAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface InterviewFeedbackResult {
  strengths: string[];
  weaknesses: string[];
  topicsToImprove: string[];
  learningResources: Array<{ title: string; url: string; type: string }>;
  performanceSummary: string;
}

export interface LlmService {
  generateQuestion(params: {
    domain: string;
    domainLabel: string;
    difficulty: string;
    resumeContext?: string;
    previousQuestions: string[];
    previousAnswers: Array<{ question: string; answer: string; score?: number }>;
    questionNumber: number;
    totalQuestions: number;
  }): Promise<GeneratedQuestion>;

  analyzeAnswer(params: {
    question: string;
    answer: string;
    domain: string;
    difficulty: string;
  }): Promise<AnswerAnalysis>;

  generateInterviewFeedback(params: {
    domain: string;
    domainLabel: string;
    difficulty: string;
    qaPairs: Array<{ question: string; answer: string; score: number; category?: string }>;
    scores: {
      overall: number;
      technical: number;
      communication: number;
      confidence: number;
      problemSolving: number;
      resumeMatch: number;
      behavioral: number;
    };
    resumeUsed: boolean;
  }): Promise<InterviewFeedbackResult>;
}
