export interface AtsAnalysisResult {
  score: number;
  keywords: string[];
  missingKeywords: string[];
  missingSections: string[];
  suggestions: string[];
  improvementTips: string[];
  grammarIssues: string[];
  formattingIssues: string[];
  reportData: AtsReportData;
}

export interface AtsReportData {
  overallScore: number;
  breakdown: {
    length: { score: number; max: number; feedback: string };
    keywords: { score: number; max: number; feedback: string };
    sections: { score: number; max: number; feedback: string };
    formatting: { score: number; max: number; feedback: string };
    grammar: { score: number; max: number; feedback: string };
    experience: { score: number; max: number; feedback: string };
    projects: { score: number; max: number; feedback: string };
    education: { score: number; max: number; feedback: string };
  };
  detectedSkills: string[];
  wordCount: number;
  pageCount: number;
  analyzedAt: string;
}

const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'react', 'node.js', 'nodejs', 'angular',
  'vue', 'next.js', 'express', 'mongodb', 'postgresql', 'mysql', 'sql', 'aws', 'azure',
  'docker', 'kubernetes', 'git', 'ci/cd', 'agile', 'scrum', 'rest api', 'graphql',
  'html', 'css', 'tailwind', 'redux', 'machine learning', 'data analysis', 'tensorflow',
  'pytorch', 'linux', 'devops', 'microservices', 'api', 'testing', 'jest', 'cypress',
  'figma', 'ui/ux', 'communication', 'leadership', 'problem solving', 'teamwork',
];

const REQUIRED_SECTIONS = ['summary', 'experience', 'education', 'skills'];
const RECOMMENDED_SECTIONS = ['projects', 'certifications', 'achievements'];

const ACTION_VERBS = [
  'developed', 'designed', 'implemented', 'led', 'managed', 'created', 'built',
  'optimized', 'improved', 'delivered', 'achieved', 'collaborated', 'automated',
];

function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.filter((kw) => lower.includes(kw));
}

function findMissingKeywords(text: string, found: string[]): string[] {
  const lower = text.toLowerCase();
  const roleHints: Record<string, string[]> = {
    frontend: ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind'],
    backend: ['node.js', 'express', 'postgresql', 'mongodb', 'api', 'rest api'],
    fullstack: ['react', 'node.js', 'mongodb', 'javascript', 'typescript'],
    data: ['python', 'sql', 'machine learning', 'data analysis'],
    devops: ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux'],
  };

  let suggestedPool = [...TECH_KEYWORDS.slice(0, 15)];

  for (const [role, keywords] of Object.entries(roleHints)) {
    if (keywords.some((k) => lower.includes(k) || found.includes(k))) {
      suggestedPool = keywords;
      break;
    }
  }

  return suggestedPool.filter((kw) => !found.includes(kw)).slice(0, 8);
}

function detectSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const skills = TECH_KEYWORDS.filter((kw) => lower.includes(kw));
  return [...new Set(skills)];
}

function checkGrammar(text: string): string[] {
  const issues: string[] = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  for (const sentence of sentences.slice(0, 20)) {
    if (sentence.trim().length > 200) {
      issues.push('Some sentences are very long — consider breaking them into shorter bullet points.');
      break;
    }
  }

  const words = text.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] ?? 0) + 1;
    }
  }

  const overused = Object.entries(wordFreq).filter(([, count]) => count > 8);
  if (overused.length > 0) {
    issues.push(`Word "${overused[0][0]}" appears frequently — vary your language.`);
  }

  if (!ACTION_VERBS.some((verb) => text.toLowerCase().includes(verb))) {
    issues.push('Use strong action verbs (developed, led, implemented) to describe achievements.');
  }

  const firstPerson = /\b(I am|I have|my responsibilities|I was responsible)\b/i.test(text);
  if (firstPerson) {
    issues.push('Avoid first-person pronouns — use concise bullet points instead.');
  }

  return [...new Set(issues)].slice(0, 5);
}

function checkFormatting(text: string, parsedData?: { contactInfo?: { hasEmail: boolean; hasPhone: boolean } }): string[] {
  const issues: string[] = [];

  if (parsedData?.contactInfo) {
    if (!parsedData.contactInfo.hasEmail) {
      issues.push('Add a professional email address in the contact section.');
    }
    if (!parsedData.contactInfo.hasPhone) {
      issues.push('Include a phone number for recruiters to reach you.');
    }
  }

  if (!/\d{4}/.test(text)) {
    issues.push('Include dates (years) for education and work experience.');
  }

  const hasBullets = /[•\-–—*]\s/.test(text) || /\n\s*[-•]\s/.test(text);
  if (!hasBullets) {
    issues.push('Use bullet points to highlight achievements and responsibilities.');
  }

  if (text.length > 8000) {
    issues.push('Resume may be too long — aim for 1-2 pages for most roles.');
  }

  return issues.slice(0, 5);
}

function scoreLength(wordCount: number, pageCount: number): { score: number; feedback: string } {
  if (wordCount >= 250 && wordCount <= 800 && pageCount <= 2) {
    return { score: 15, feedback: 'Ideal resume length (1-2 pages).' };
  }
  if (wordCount >= 150 && wordCount <= 1000) {
    return { score: 10, feedback: 'Acceptable length, but 1-2 pages is optimal.' };
  }
  if (wordCount < 150) {
    return { score: 4, feedback: 'Resume is too short — add more detail about experience and skills.' };
  }
  return { score: 6, feedback: 'Resume may be too long — trim less relevant content.' };
}

function scoreKeywords(found: string[]): { score: number; feedback: string } {
  const count = found.length;
  if (count >= 10) return { score: 20, feedback: `Strong keyword coverage (${count} relevant terms found).` };
  if (count >= 6) return { score: 14, feedback: `Good keywords (${count}), add more role-specific terms.` };
  if (count >= 3) return { score: 8, feedback: `Limited keywords (${count}) — tailor to job descriptions.` };
  return { score: 3, feedback: 'Very few industry keywords detected.' };
}

function scoreSections(sections: Record<string, boolean>): { score: number; feedback: string; missing: string[] } {
  const missing = REQUIRED_SECTIONS.filter((s) => !sections[s]);
  const recommendedMissing = RECOMMENDED_SECTIONS.filter((s) => !sections[s]);
  const presentCount = REQUIRED_SECTIONS.length - missing.length;

  let score = presentCount * 4;
  if (sections.projects) score += 3;
  if (sections.certifications) score += 2;
  if (sections.achievements) score += 1;

  const allMissing = [...missing, ...recommendedMissing.map((s) => `${s} (recommended)`)];

  return {
    score: Math.min(score, 20),
    feedback:
      missing.length === 0
        ? 'All essential sections present.'
        : `Missing sections: ${missing.join(', ')}.`,
    missing: allMissing,
  };
}

function scoreExperience(text: string): { score: number; feedback: string } {
  const hasExperience = /experience|work history|employment/i.test(text);
  const hasMetrics = /\d+%|\$\d+|\d+\+|\d+ (users|clients|projects|team)/i.test(text);
  const hasActionVerbs = ACTION_VERBS.filter((v) => text.toLowerCase().includes(v)).length;

  if (!hasExperience) return { score: 0, feedback: 'No experience section detected.' };

  let score = 8;
  if (hasActionVerbs >= 3) score += 4;
  if (hasMetrics) score += 3;

  return {
    score: Math.min(score, 15),
    feedback: hasMetrics
      ? 'Experience includes quantifiable achievements.'
      : 'Add metrics (%, numbers) to quantify your impact.',
  };
}

function scoreProjects(sections: Record<string, boolean>, text: string): { score: number; feedback: string } {
  if (!sections.projects) {
    return { score: 0, feedback: 'Add a projects section to showcase practical skills.' };
  }
  const projectMentions = (text.match(/project/gi) ?? []).length;
  return {
    score: Math.min(projectMentions >= 2 ? 10 : 6, 10),
    feedback: projectMentions >= 2 ? 'Projects section looks solid.' : 'Expand project descriptions with tech stack and outcomes.',
  };
}

function scoreEducation(sections: Record<string, boolean>, text: string): { score: number; feedback: string } {
  if (!sections.education) {
    return { score: 0, feedback: 'Education section is missing.' };
  }
  const hasDegree = /b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|b\.?tech|b\.?e\.?|ph\.?d|bachelor|master|degree/i.test(text);
  return {
    score: hasDegree ? 10 : 5,
    feedback: hasDegree ? 'Education details are present.' : 'Include degree name and institution clearly.',
  };
}

export function analyzeResume(
  rawText: string,
  parsedData?: {
    pageCount?: number;
    wordCount?: number;
    sections?: Record<string, boolean>;
    contactInfo?: { hasEmail: boolean; hasPhone: boolean; hasLinkedIn: boolean };
  }
): AtsAnalysisResult {
  const wordCount = parsedData?.wordCount ?? rawText.split(/\s+/).filter(Boolean).length;
  const pageCount = parsedData?.pageCount ?? Math.ceil(wordCount / 400);
  const sections = parsedData?.sections ?? {};

  const keywords = extractKeywords(rawText);
  const missingKeywords = findMissingKeywords(rawText, keywords);
  const detectedSkills = detectSkills(rawText);
  const grammarIssues = checkGrammar(rawText);
  const formattingIssues = checkFormatting(rawText, parsedData);

  const lengthResult = scoreLength(wordCount, pageCount);
  const keywordsResult = scoreKeywords(keywords);
  const sectionsResult = scoreSections(sections);
  const formattingScore = Math.max(0, 10 - formattingIssues.length * 2);
  const grammarScore = Math.max(0, 10 - grammarIssues.length * 2);
  const experienceResult = scoreExperience(rawText);
  const projectsResult = scoreProjects(sections, rawText);
  const educationResult = scoreEducation(sections, rawText);

  const totalScore =
    lengthResult.score +
    keywordsResult.score +
    sectionsResult.score +
    formattingScore +
    grammarScore +
    experienceResult.score +
    projectsResult.score +
    educationResult.score;

  const score = Math.min(100, Math.max(0, totalScore));

  const suggestions: string[] = [];
  const improvementTips: string[] = [];

  if (sectionsResult.missing.length > 0) {
    suggestions.push(`Add missing sections: ${sectionsResult.missing.slice(0, 3).join(', ')}.`);
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Include keywords: ${missingKeywords.slice(0, 5).join(', ')}.`);
  }
  if (formattingIssues.length > 0) {
    suggestions.push(formattingIssues[0]);
  }

  improvementTips.push('Tailor your resume keywords to each job description.');
  improvementTips.push('Start bullet points with strong action verbs and quantify results.');
  improvementTips.push('Keep formatting ATS-friendly: standard fonts, no tables or graphics.');
  if (!parsedData?.contactInfo?.hasLinkedIn) {
    improvementTips.push('Add your LinkedIn profile URL in the contact section.');
  }

  const reportData: AtsReportData = {
    overallScore: score,
    breakdown: {
      length: { score: lengthResult.score, max: 15, feedback: lengthResult.feedback },
      keywords: { score: keywordsResult.score, max: 20, feedback: keywordsResult.feedback },
      sections: { score: sectionsResult.score, max: 20, feedback: sectionsResult.feedback },
      formatting: { score: formattingScore, max: 10, feedback: formattingIssues[0] ?? 'Formatting looks good.' },
      grammar: { score: grammarScore, max: 10, feedback: grammarIssues[0] ?? 'No major grammar issues detected.' },
      experience: { score: experienceResult.score, max: 15, feedback: experienceResult.feedback },
      projects: { score: projectsResult.score, max: 10, feedback: projectsResult.feedback },
      education: { score: educationResult.score, max: 10, feedback: educationResult.feedback },
    },
    detectedSkills,
    wordCount,
    pageCount,
    analyzedAt: new Date().toISOString(),
  };

  return {
    score,
    keywords,
    missingKeywords,
    missingSections: sectionsResult.missing,
    suggestions: suggestions.slice(0, 6),
    improvementTips: improvementTips.slice(0, 5),
    grammarIssues,
    formattingIssues,
    reportData,
  };
}

export function generateAtsReportHtml(
  resumeTitle: string,
  analysis: AtsAnalysisResult,
  userName: string
): string {
  const { reportData } = analysis;

  const breakdownRows = Object.entries(reportData.breakdown)
    .map(
      ([key, val]) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;text-transform:capitalize">${key}</td>
         <td style="padding:8px;border-bottom:1px solid #eee">${val.score}/${val.max}</td>
         <td style="padding:8px;border-bottom:1px solid #eee">${val.feedback}</td></tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ATS Report - ${resumeTitle}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e}
  h1{color:#4f46e5} .score{font-size:48px;font-weight:bold;color:#4f46e5}
  table{width:100%;border-collapse:collapse;margin:20px 0}
  th{background:#f3f4f6;padding:10px;text-align:left}
  .tag{display:inline-block;background:#ede9fe;color:#4f46e5;padding:4px 10px;border-radius:20px;margin:4px;font-size:13px}
  .section{margin:24px 0} ul{line-height:1.8}
</style></head><body>
<h1>ATS Resume Analysis Report</h1>
<p><strong>Candidate:</strong> ${userName} | <strong>Resume:</strong> ${resumeTitle}</p>
<p><strong>Generated:</strong> ${new Date(reportData.analyzedAt).toLocaleString()}</p>
<div class="score">${analysis.score}/100</div>
<p>Overall ATS Compatibility Score</p>

<div class="section"><h2>Score Breakdown</h2>
<table><thead><tr><th>Category</th><th>Score</th><th>Feedback</th></tr></thead>
<tbody>${breakdownRows}</tbody></table></div>

<div class="section"><h2>Detected Skills</h2>
${reportData.detectedSkills.map((s) => `<span class="tag">${s}</span>`).join('') || '<p>None detected</p>'}
</div>

<div class="section"><h2>Missing Keywords</h2><ul>
${analysis.missingKeywords.map((k) => `<li>${k}</li>`).join('') || '<li>None — great coverage!</li>'}
</ul></div>

<div class="section"><h2>Suggestions</h2><ul>
${analysis.suggestions.map((s) => `<li>${s}</li>`).join('')}
</ul></div>

<div class="section"><h2>Improvement Tips</h2><ul>
${analysis.improvementTips.map((t) => `<li>${t}</li>`).join('')}
</ul></div>

<div class="section"><h2>Grammar Issues</h2><ul>
${analysis.grammarIssues.map((g) => `<li>${g}</li>`).join('') || '<li>No issues found</li>'}
</ul></div>

<p style="margin-top:40px;color:#888;font-size:12px">Generated by AI Interviewer Platform</p>
</body></html>`;
}
