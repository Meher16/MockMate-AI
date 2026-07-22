export type ResumeTemplate = 'classic' | 'modern' | 'minimal';

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
  source: 'builder' | 'upload';
  template?: ResumeTemplate;
  builderData?: ResumeBuilderData;
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

export function createEmptyBuilderData(): ResumeBuilderData {
  return {
    template: 'modern',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      website: '',
      jobTitle: '',
    },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: [],
  };
}

export function builderDataToRawText(data: ResumeBuilderData): string {
  const lines: string[] = [];
  const p = data.personalInfo;

  lines.push(p.fullName || 'Resume');
  if (p.jobTitle) lines.push(p.jobTitle);
  const contact = [p.email, p.phone, p.location, p.linkedIn, p.website].filter(Boolean);
  if (contact.length) lines.push(contact.join(' | '));

  if (data.summary) {
    lines.push('', 'SUMMARY', data.summary);
  }

  if (data.skills.length) {
    lines.push('', 'SKILLS', data.skills.join(', '));
  }

  if (data.experience.length) {
    lines.push('', 'EXPERIENCE');
    for (const exp of data.experience) {
      const dates = exp.current
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;
      lines.push(`${exp.role} at ${exp.company}`, dates, exp.location, exp.description);
    }
  }

  if (data.education.length) {
    lines.push('', 'EDUCATION');
    for (const edu of data.education) {
      lines.push(
        `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
        edu.institution,
        `${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`
      );
    }
  }

  if (data.projects.length) {
    lines.push('', 'PROJECTS');
    for (const proj of data.projects) {
      lines.push(proj.name, proj.technologies, proj.description, proj.url);
    }
  }

  if (data.certifications.length) {
    lines.push('', 'CERTIFICATIONS');
    for (const cert of data.certifications) {
      lines.push(`${cert.name} - ${cert.issuer} (${cert.date})`);
    }
  }

  if (data.languages.length) {
    lines.push('', 'LANGUAGES');
    for (const lang of data.languages) {
      lines.push(`${lang.language} - ${lang.proficiency}`);
    }
  }

  if (data.achievements.length) {
    lines.push('', 'ACHIEVEMENTS');
    for (const ach of data.achievements) {
      lines.push(`• ${ach}`);
    }
  }

  return lines.filter((l) => l !== undefined).join('\n');
}

export function detectSectionsFromBuilder(data: ResumeBuilderData): Record<string, boolean> {
  return {
    summary: !!data.summary.trim(),
    experience: data.experience.length > 0,
    education: data.education.length > 0,
    skills: data.skills.length > 0,
    projects: data.projects.length > 0,
    certifications: data.certifications.length > 0,
    achievements: data.achievements.length > 0,
  };
}

export function buildParsedDataFromBuilder(data: ResumeBuilderData): ResumeBuilderParsedData {
  const rawText = builderDataToRawText(data);
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;

  return {
    source: 'builder',
    template: data.template,
    builderData: data,
    pageCount: Math.max(1, Math.ceil(wordCount / 400)),
    wordCount,
    extractedAt: new Date().toISOString(),
    sections: detectSectionsFromBuilder(data),
    contactInfo: {
      hasEmail: !!data.personalInfo.email,
      hasPhone: !!data.personalInfo.phone,
      hasLinkedIn: !!data.personalInfo.linkedIn,
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBullets(text: string): string {
  return text
    .split('\n')
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line.replace(/^[•\-*]\s*/, ''))}</li>`)
    .join('');
}

export function generateResumeHtml(data: ResumeBuilderData): string {
  const p = data.personalInfo;
  const template = data.template;

  const contactParts = [
    p.email && `<span>${escapeHtml(p.email)}</span>`,
    p.phone && `<span>${escapeHtml(p.phone)}</span>`,
    p.location && `<span>${escapeHtml(p.location)}</span>`,
    p.linkedIn && `<span>${escapeHtml(p.linkedIn)}</span>`,
    p.website && `<span>${escapeHtml(p.website)}</span>`,
  ].filter(Boolean);

  const styles: Record<ResumeTemplate, string> = {
    classic: `
      body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.5; }
      h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: 1px; text-transform: uppercase; }
      .subtitle { font-size: 14px; color: #444; margin-bottom: 8px; }
      .contact { font-size: 12px; color: #555; display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; }
      h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 20px 0 10px; }
      .entry { margin-bottom: 14px; }
      .entry-header { display: flex; justify-content: space-between; font-weight: bold; }
      .entry-sub { font-style: italic; color: #555; font-size: 13px; }
      .skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { background: #f0f0f0; padding: 4px 10px; border-radius: 4px; font-size: 12px; }
      ul { margin: 4px 0; padding-left: 18px; font-size: 13px; }
    `,
    modern: `
      body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 0; line-height: 1.5; }
      .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 32px 40px; }
      h1 { font-size: 32px; margin: 0 0 4px; }
      .subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 12px; }
      .contact { font-size: 13px; display: flex; flex-wrap: wrap; gap: 16px; opacity: 0.85; }
      .body { padding: 32px 40px; }
      h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #4f46e5; margin: 24px 0 12px; }
      .entry { margin-bottom: 16px; }
      .entry-header { display: flex; justify-content: space-between; font-weight: 600; }
      .entry-sub { color: #64748b; font-size: 13px; }
      .skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { background: #ede9fe; color: #4f46e5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
      ul { margin: 4px 0; padding-left: 18px; font-size: 13px; color: #475569; }
    `,
    minimal: `
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 700px; margin: 0 auto; padding: 48px 40px; line-height: 1.6; }
      h1 { font-size: 24px; font-weight: 300; margin: 0 0 2px; letter-spacing: 3px; text-transform: uppercase; }
      .subtitle { font-size: 13px; color: #888; margin-bottom: 16px; letter-spacing: 1px; }
      .contact { font-size: 11px; color: #999; margin-bottom: 32px; }
      .contact span:not(:last-child)::after { content: ' · '; }
      h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #999; margin: 28px 0 12px; }
      .entry { margin-bottom: 20px; }
      .entry-header { font-weight: 500; font-size: 14px; }
      .entry-sub { color: #888; font-size: 12px; margin-top: 2px; }
      .skills { font-size: 13px; color: #555; }
      ul { margin: 6px 0; padding-left: 16px; font-size: 13px; color: #555; list-style: none; }
      ul li::before { content: '— '; color: #ccc; }
    `,
  };

  const headerClass = template === 'modern' ? 'header' : '';
  const bodyWrapStart = template === 'modern' ? '<div class="body">' : '';
  const bodyWrapEnd = template === 'modern' ? '</div>' : '';

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(p.fullName || 'Resume')}</title>
<style>${styles[template]} @media print { body { padding: 20px; } }</style></head><body>`;

  html += `<div class="${headerClass}">`;
  html += `<h1>${escapeHtml(p.fullName || 'Your Name')}</h1>`;
  if (p.jobTitle) html += `<div class="subtitle">${escapeHtml(p.jobTitle)}</div>`;
  if (contactParts.length) html += `<div class="contact">${contactParts.join('')}</div>`;
  html += `</div>${bodyWrapStart}`;

  if (data.summary) {
    html += `<h2>Summary</h2><p style="font-size:13px">${escapeHtml(data.summary)}</p>`;
  }

  if (data.skills.length) {
    html += `<h2>Skills</h2><div class="skills">${data.skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>`;
  }

  if (data.experience.length) {
    html += `<h2>Experience</h2>`;
    for (const exp of data.experience) {
      const dates = exp.current ? `${escapeHtml(exp.startDate)} - Present` : `${escapeHtml(exp.startDate)} - ${escapeHtml(exp.endDate)}`;
      html += `<div class="entry"><div class="entry-header"><span>${escapeHtml(exp.role)}</span><span>${dates}</span></div>`;
      html += `<div class="entry-sub">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ''}</div>`;
      if (exp.description) html += `<ul>${formatBullets(exp.description)}</ul>`;
      html += `</div>`;
    }
  }

  if (data.education.length) {
    html += `<h2>Education</h2>`;
    for (const edu of data.education) {
      html += `<div class="entry"><div class="entry-header"><span>${escapeHtml(edu.degree)}${edu.field ? ` in ${escapeHtml(edu.field)}` : ''}</span><span>${escapeHtml(edu.startDate)} - ${escapeHtml(edu.endDate)}</span></div>`;
      html += `<div class="entry-sub">${escapeHtml(edu.institution)}${edu.gpa ? ` · GPA: ${escapeHtml(edu.gpa)}` : ''}</div></div>`;
    }
  }

  if (data.projects.length) {
    html += `<h2>Projects</h2>`;
    for (const proj of data.projects) {
      html += `<div class="entry"><div class="entry-header"><span>${escapeHtml(proj.name)}</span></div>`;
      if (proj.technologies) html += `<div class="entry-sub">${escapeHtml(proj.technologies)}</div>`;
      if (proj.description) html += `<p style="font-size:13px;margin:4px 0">${escapeHtml(proj.description)}</p>`;
      html += `</div>`;
    }
  }

  if (data.certifications.length) {
    html += `<h2>Certifications</h2>`;
    for (const cert of data.certifications) {
      html += `<div class="entry"><div class="entry-header"><span>${escapeHtml(cert.name)}</span><span>${escapeHtml(cert.date)}</span></div>`;
      html += `<div class="entry-sub">${escapeHtml(cert.issuer)}</div></div>`;
    }
  }

  if (data.languages.length) {
    html += `<h2>Languages</h2><div class="skills">${data.languages.map((l) => `<span class="skill-tag">${escapeHtml(l.language)} (${escapeHtml(l.proficiency)})</span>`).join('')}</div>`;
  }

  if (data.achievements.length) {
    html += `<h2>Achievements</h2><ul>${data.achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`;
  }

  html += `${bodyWrapEnd}</body></html>`;
  return html;
}
