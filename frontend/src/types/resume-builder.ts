export type ResumeTemplate = "classic" | "modern" | "minimal";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
  jobTitle: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  url: string;
  technologies: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
}

export interface ResumeBuilderData {
  template: ResumeTemplate;
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  achievements: string[];
}

export interface ResumeBuilderParsedData {
  source?: "builder" | "upload";
  template?: ResumeTemplate;
  builderData?: ResumeBuilderData;
  pageCount?: number;
  wordCount?: number;
  extractedAt?: string;
  sections?: Record<string, boolean>;
  contactInfo?: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
  };
}

export const TEMPLATE_OPTIONS: { id: ResumeTemplate; label: string; description: string }[] = [
  { id: "modern", label: "Modern", description: "Gradient header, clean sans-serif" },
  { id: "classic", label: "Classic", description: "Traditional serif, ATS-friendly" },
  { id: "minimal", label: "Minimal", description: "Lightweight, lots of whitespace" },
];

export function createId(): string {
  return crypto.randomUUID();
}

export function createEmptyBuilderData(): ResumeBuilderData {
  return {
    template: "modern",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
      jobTitle: "",
    },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
  };
}

export function getBuilderDataFromResume(parsedData: unknown): ResumeBuilderData | null {
  if (!parsedData || typeof parsedData !== "object") return null;
  const data = parsedData as ResumeBuilderParsedData;
  if (data.source === "builder" && data.builderData) return data.builderData;
  return null;
}

export function isBuiltResume(parsedData: unknown): boolean {
  if (!parsedData || typeof parsedData !== "object") return false;
  return (parsedData as ResumeBuilderParsedData).source === "builder";
}
