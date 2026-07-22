export interface ResumeParsedData {
  pageCount: number;
  wordCount: number;
  extractedAt: string;
  sections: Record<string, boolean>;
  contactInfo: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
  };
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  fileName?: string | null;
  filePath?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  rawText?: string | null;
  parsedData?: ResumeParsedData | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  atsScores?: AtsScoreSummary[];
}

export interface AtsScoreSummary {
  id: string;
  score: number;
  createdAt: string;
}

export interface AtsBreakdownItem {
  score: number;
  max: number;
  feedback: string;
}

export interface AtsReportData {
  overallScore: number;
  breakdown: {
    length: AtsBreakdownItem;
    keywords: AtsBreakdownItem;
    sections: AtsBreakdownItem;
    formatting: AtsBreakdownItem;
    grammar: AtsBreakdownItem;
    experience: AtsBreakdownItem;
    projects: AtsBreakdownItem;
    education: AtsBreakdownItem;
  };
  detectedSkills: string[];
  wordCount: number;
  pageCount: number;
  analyzedAt: string;
}

export interface AtsScore {
  id: string;
  userId: string;
  resumeId: string;
  score: number;
  keywords?: string[] | null;
  missingKeywords?: string[] | null;
  missingSections?: string[] | null;
  suggestions?: string[] | null;
  improvementTips?: string[] | null;
  grammarIssues?: string[] | null;
  formattingIssues?: string[] | null;
  reportData?: AtsReportData | null;
  createdAt: string;
  resume?: { id: string; title: string; rawText?: string | null };
}

export interface DashboardStats {
  resumeStatus: "none" | "uploaded" | "built";
  resumeCount: number;
  primaryResume: { id: string; title: string; updatedAt: string } | null;
  atsScore: number | null;
  atsScoreDate: string | null;
  interviewCount: number;
  averageScore: number | null;
}
