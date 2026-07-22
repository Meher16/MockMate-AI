import { extractTextFromPdf } from '../utils/file.utils';

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

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  summary: [/summary/i, /objective/i, /profile/i, /about me/i],
  experience: [/experience/i, /work history/i, /employment/i, /professional experience/i],
  education: [/education/i, /academic/i, /qualification/i, /degree/i],
  skills: [/skills/i, /technical skills/i, /core competencies/i, /technologies/i],
  projects: [/projects/i, /portfolio/i, /personal projects/i],
  certifications: [/certifications/i, /certificates/i, /licenses/i],
  achievements: [/achievements/i, /awards/i, /honors/i, /accomplishments/i],
};

export function detectSections(text: string): Record<string, boolean> {
  const sections: Record<string, boolean> = {};

  for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
    sections[section] = patterns.some((pattern) => pattern.test(text));
  }

  return sections;
}

export function detectContactInfo(text: string) {
  return {
    hasEmail: /[\w.-]+@[\w.-]+\.\w{2,}/.test(text),
    hasPhone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
    hasLinkedIn: /linkedin\.com/i.test(text),
  };
}

export async function parseResumePdf(filePath: string): Promise<{
  rawText: string;
  parsedData: ResumeParsedData;
}> {
  const { text, pageCount, wordCount } = await extractTextFromPdf(filePath);

  if (!text || wordCount < 10) {
    throw new Error('Could not extract meaningful text from PDF. The file may be scanned or image-based.');
  }

  const parsedData: ResumeParsedData = {
    pageCount,
    wordCount,
    extractedAt: new Date().toISOString(),
    sections: detectSections(text),
    contactInfo: detectContactInfo(text),
  };

  return { rawText: text, parsedData };
}

export { ResumeParsedData };
