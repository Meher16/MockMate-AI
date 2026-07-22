import prisma from '../config/database';
import { AppError } from '../utils/error.utils';
import { analyzeResume, generateAtsReportHtml, AtsAnalysisResult } from './ats.service';
import { resumeService } from './resume.service';
import { ResumeParsedData } from './pdf.service';

export class AtsService {
  async analyze(userId: string, resumeId: string) {
    const resume = await resumeService.getById(userId, resumeId);

    if (!resume.rawText) {
      throw new AppError(400, 'Resume has no text content to analyze');
    }

    const parsedData = resume.parsedData as ResumeParsedData | null;

    const analysis = analyzeResume(resume.rawText, parsedData ?? undefined);

    const atsScore = await prisma.atsScore.create({
      data: {
        userId,
        resumeId,
        score: analysis.score,
        keywords: analysis.keywords,
        missingKeywords: analysis.missingKeywords,
        missingSections: analysis.missingSections,
        suggestions: analysis.suggestions,
        improvementTips: analysis.improvementTips,
        grammarIssues: analysis.grammarIssues,
        formattingIssues: analysis.formattingIssues,
        reportData: analysis.reportData as object,
      },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'ATS_ANALYZED',
        entityType: 'AtsScore',
        entityId: atsScore.id,
        metadata: { score: analysis.score, resumeId },
      },
    });

    return { atsScore, analysis };
  }

  async listScores(userId: string) {
    return prisma.atsScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: { select: { id: true, title: true } },
      },
    });
  }

  async getScore(userId: string, scoreId: string) {
    const score = await prisma.atsScore.findFirst({
      where: { id: scoreId, userId },
      include: {
        resume: { select: { id: true, title: true, rawText: true } },
      },
    });

    if (!score) {
      throw new AppError(404, 'ATS score not found');
    }

    return score;
  }

  async getLatestForResume(userId: string, resumeId: string) {
    return prisma.atsScore.findFirst({
      where: { userId, resumeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateReport(userId: string, scoreId: string, userName: string): Promise<string> {
    const score = await this.getScore(userId, scoreId);
    const reportData = score.reportData as AtsAnalysisResult['reportData'];

    const analysis: AtsAnalysisResult = {
      score: score.score,
      keywords: (score.keywords as string[]) ?? [],
      missingKeywords: (score.missingKeywords as string[]) ?? [],
      missingSections: (score.missingSections as string[]) ?? [],
      suggestions: (score.suggestions as string[]) ?? [],
      improvementTips: (score.improvementTips as string[]) ?? [],
      grammarIssues: (score.grammarIssues as string[]) ?? [],
      formattingIssues: (score.formattingIssues as string[]) ?? [],
      reportData,
    };

    return generateAtsReportHtml(score.resume.title, analysis, userName);
  }
}

export const atsService = new AtsService();
