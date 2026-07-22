import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { AppError } from '../utils/error.utils';
import { deleteFile } from '../utils/file.utils';
import { parseResumePdf, ResumeParsedData, detectSections, detectContactInfo } from './pdf.service';
import { uploadDir } from '../middleware/upload.middleware';

export interface UpdateResumeInput {
  title?: string;
  rawText?: string;
  isPrimary?: boolean;
}

export class ResumeService {
  async listByUser(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
      include: {
        atsScores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, score: true, createdAt: true },
        },
      },
    });
  }

  async getById(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        atsScores: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!resume) {
      throw new AppError(404, 'Resume not found');
    }

    return resume;
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
    title?: string
  ) {
    const filePath = path.join(uploadDir, file.filename);

    try {
      const { rawText, parsedData } = await parseResumePdf(filePath);

      const existingCount = await prisma.resume.count({ where: { userId } });
      const isPrimary = existingCount === 0;

      const resume = await prisma.resume.create({
        data: {
          userId,
          title: title ?? file.originalname.replace(/\.pdf$/i, ''),
          fileName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          rawText,
          parsedData: parsedData as object,
          isPrimary,
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'RESUME_UPLOADED',
          entityType: 'Resume',
          entityId: resume.id,
          metadata: { fileName: file.originalname, wordCount: parsedData.wordCount },
        },
      });

      return resume;
    } catch (error) {
      await deleteFile(filePath);
      if (error instanceof AppError) throw error;
      throw new AppError(
        400,
        error instanceof Error ? error.message : 'Failed to parse resume PDF'
      );
    }
  }

  async update(userId: string, resumeId: string, input: UpdateResumeInput) {
    const resume = await this.getById(userId, resumeId);

    if (input.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    const parsedData = resume.parsedData as ResumeParsedData | null;
    let updatedParsedData = parsedData;

    if (input.rawText !== undefined) {
      updatedParsedData = {
        ...(parsedData ?? {
          pageCount: 1,
          wordCount: 0,
          extractedAt: new Date().toISOString(),
          sections: {},
          contactInfo: { hasEmail: false, hasPhone: false, hasLinkedIn: false },
        }),
        wordCount: input.rawText.split(/\s+/).filter(Boolean).length,
        extractedAt: new Date().toISOString(),
        sections: detectSections(input.rawText),
        contactInfo: detectContactInfo(input.rawText),
      };
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        title: input.title,
        rawText: input.rawText,
        parsedData: updatedParsedData as object | undefined,
        isPrimary: input.isPrimary,
      },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'RESUME_UPDATED',
        entityType: 'Resume',
        entityId: resumeId,
      },
    });

    return updated;
  }

  async delete(userId: string, resumeId: string) {
    const resume = await this.getById(userId, resumeId);

    if (resume.filePath && fs.existsSync(resume.filePath)) {
      await deleteFile(resume.filePath);
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    if (resume.isPrimary) {
      const next = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      if (next) {
        await prisma.resume.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'RESUME_DELETED',
        entityType: 'Resume',
        entityId: resumeId,
      },
    });
  }

  async getFilePath(userId: string, resumeId: string) {
    const resume = await this.getById(userId, resumeId);

    if (!resume.filePath || !fs.existsSync(resume.filePath)) {
      throw new AppError(404, 'Resume file not found');
    }

    return {
      filePath: resume.filePath,
      fileName: resume.fileName ?? 'resume.pdf',
    };
  }

  async getDashboardStats(userId: string) {
    const [resumeCount, primaryResume, latestAts, interviewCount, builtCount] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.resume.findFirst({
        where: { userId, isPrimary: true },
        select: { id: true, title: true, updatedAt: true },
      }),
      prisma.atsScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { score: true, createdAt: true },
      }),
      prisma.interview.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.resume.count({
        where: {
          userId,
          parsedData: { path: ['source'], equals: 'builder' },
        },
      }),
    ]);

    let resumeStatus: 'none' | 'uploaded' | 'built' = 'none';
    if (resumeCount > 0) {
      if (builtCount === resumeCount) resumeStatus = 'built';
      else if (builtCount > 0) resumeStatus = 'uploaded';
      else resumeStatus = 'uploaded';
    }

    return {
      resumeStatus,
      resumeCount,
      primaryResume,
      atsScore: latestAts?.score ?? null,
      atsScoreDate: latestAts?.createdAt ?? null,
      interviewCount,
      averageScore: null,
    };
  }
}

export const resumeService = new ResumeService();
