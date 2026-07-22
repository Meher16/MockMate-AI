import PDFDocument from 'pdfkit';
import {
  ResumeBuilderData,
  builderDataToRawText,
  buildParsedDataFromBuilder,
  generateResumeHtml,
  createEmptyBuilderData,
} from '../types/resume-builder.types';
import prisma from '../config/database';
import { AppError } from '../utils/error.utils';

export class ResumeBuilderService {
  async create(userId: string, title: string, builderData: ResumeBuilderData) {
    const rawText = builderDataToRawText(builderData);
    const parsedData = buildParsedDataFromBuilder(builderData);

    const existingCount = await prisma.resume.count({ where: { userId } });
    const isPrimary = existingCount === 0;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        rawText,
        parsedData: parsedData as object,
        isPrimary,
      },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'RESUME_BUILT',
        entityType: 'Resume',
        entityId: resume.id,
        metadata: { template: builderData.template, wordCount: parsedData.wordCount },
      },
    });

    return resume;
  }

  async update(userId: string, resumeId: string, title: string | undefined, builderData: ResumeBuilderData) {
    const existing = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!existing) throw new AppError(404, 'Resume not found');

    const rawText = builderDataToRawText(builderData);
    const parsedData = buildParsedDataFromBuilder(builderData);

    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        title: title ?? existing.title,
        rawText,
        parsedData: parsedData as object,
      },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'RESUME_BUILDER_UPDATED',
        entityType: 'Resume',
        entityId: resumeId,
      },
    });

    return resume;
  }

  getBuilderData(parsedData: unknown): ResumeBuilderData | null {
    if (!parsedData || typeof parsedData !== 'object') return null;
    const data = parsedData as { source?: string; builderData?: ResumeBuilderData };
    if (data.source === 'builder' && data.builderData) {
      return data.builderData;
    }
    return null;
  }

  async exportHtml(userId: string, resumeId: string): Promise<string> {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new AppError(404, 'Resume not found');

    const builderData = this.getBuilderData(resume.parsedData);
    if (builderData) {
      return generateResumeHtml(builderData);
    }

    return this.generatePlainTextHtml(resume.title, resume.rawText ?? '');
  }

  async exportPdf(userId: string, resumeId: string): Promise<Buffer> {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) throw new AppError(404, 'Resume not found');

    const builderData = this.getBuilderData(resume.parsedData);
    const text = builderData ? builderDataToRawText(builderData) : (resume.rawText ?? '');

    return this.generatePdfBuffer(resume.title, text, builderData ?? undefined);
  }

  convertUploadToBuilder(rawText: string): ResumeBuilderData {
    const data = createEmptyBuilderData();
    data.summary = rawText.slice(0, 500);
    data.template = 'modern';
    return data;
  }

  private generatePlainTextHtml(title: string, rawText: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#1a1a1a}
pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head>
<body><h1>${title}</h1><pre>${rawText.replace(/</g, '&lt;')}</pre></body></html>`;
  }

  private generatePdfBuffer(
    title: string,
    text: string,
    builderData?: ResumeBuilderData
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      if (builderData) {
        const p = builderData.personalInfo;
        doc.fontSize(22).font('Helvetica-Bold').text(p.fullName || title, { align: 'center' });
        if (p.jobTitle) {
          doc.fontSize(12).font('Helvetica').text(p.jobTitle, { align: 'center' });
        }
        const contact = [p.email, p.phone, p.location].filter(Boolean).join(' | ');
        if (contact) {
          doc.fontSize(9).fillColor('#555555').text(contact, { align: 'center' });
        }
        doc.moveDown(1).fillColor('#000000');

        const addSection = (heading: string) => {
          doc.moveDown(0.5).fontSize(11).font('Helvetica-Bold').fillColor('#4f46e5').text(heading.toUpperCase());
          doc.moveDown(0.3).fillColor('#000000').font('Helvetica');
        };

        if (builderData.summary) {
          addSection('Summary');
          doc.fontSize(10).text(builderData.summary);
        }

        if (builderData.skills.length) {
          addSection('Skills');
          doc.fontSize(10).text(builderData.skills.join(' · '));
        }

        for (const exp of builderData.experience) {
          addSection('Experience');
          const dates = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
          doc.fontSize(10).font('Helvetica-Bold').text(`${exp.role} — ${exp.company}`);
          doc.font('Helvetica').fontSize(9).fillColor('#555555').text(`${dates} | ${exp.location}`);
          doc.fillColor('#000000').fontSize(10).text(exp.description);
        }

        for (const edu of builderData.education) {
          addSection('Education');
          doc.fontSize(10).font('Helvetica-Bold').text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`);
          doc.font('Helvetica').fontSize(9).text(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`);
        }

        if (builderData.projects.length) {
          addSection('Projects');
          for (const proj of builderData.projects) {
            doc.fontSize(10).font('Helvetica-Bold').text(proj.name);
            doc.font('Helvetica').fontSize(9).text(`${proj.technologies}\n${proj.description}`);
          }
        }
      } else {
        doc.fontSize(18).font('Helvetica-Bold').text(title);
        doc.moveDown().fontSize(10).font('Helvetica').text(text, { lineGap: 4 });
      }

      doc.end();
    });
  }
}

export const resumeBuilderService = new ResumeBuilderService();

export { buildParsedDataFromBuilder, builderDataToRawText, generateResumeHtml };
