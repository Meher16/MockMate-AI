import prisma from '../config/database';
import { AppError } from '../utils/error.utils';
import {
  scoreToPercent,
  computeCommunicationScore,
  computeResumeMatch,
  computeConfidenceFromCamera,
  isBehavioralCategory,
  computeOverallScore,
  aggregateCameraMetrics,
} from '../utils/scoring.utils';
import { llmService } from './ai/llm.service';
import { DOMAIN_LABELS } from './ai/llm.types';
import PDFDocument from 'pdfkit';

interface AnswerAnalysisStored {
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  cameraMetrics?: {
    avgEyeContact: number;
    avgHeadStability: number;
    lookingAwayCount: number;
    multipleFacesCount: number;
    samples: number;
  };
}

export interface FeedbackScores {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  resumeMatchScore: number;
  behavioralScore: number;
}

export class FeedbackService {
  async generate(userId: string, interviewId: string) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId },
      include: {
        resume: { select: { rawText: true, title: true } },
        questions: { orderBy: { orderIndex: 'asc' }, include: { answer: true } },
        feedback: true,
      },
    });

    if (!interview) throw new AppError(404, 'Interview not found');
    if (interview.status !== 'COMPLETED') {
      throw new AppError(400, 'Interview must be completed before generating feedback');
    }
    if (interview.feedback) {
      return interview.feedback;
    }

    const answered = interview.questions.filter((q) => q.answer);
    if (!answered.length) {
      throw new AppError(400, 'No answers to analyze');
    }

    const scores_raw = answered.map((q) => q.answer!.score ?? 5);
    const avgRaw = scores_raw.reduce((a, b) => a + b, 0) / scores_raw.length;

    const answerTexts = answered.map((q) => q.answer!.answerText);
    const cameraMetricsList = answered.map((q) => {
      const analysis = q.answer!.analysis as AnswerAnalysisStored | null;
      return analysis?.cameraMetrics;
    });

    const technicalScore = scoreToPercent(avgRaw);
    const communicationScore = computeCommunicationScore(answerTexts);
    const confidenceScore = computeConfidenceFromCamera(cameraMetricsList);
    const resumeMatchScore = computeResumeMatch(interview.resume?.rawText ?? undefined, answerTexts);

    const behavioralQuestions = answered.filter((q) => isBehavioralCategory(q.category));
    const behavioralScore =
      behavioralQuestions.length > 0
        ? scoreToPercent(
            behavioralQuestions.reduce((s, q) => s + (q.answer!.score ?? 5), 0) /
              behavioralQuestions.length
          )
        : Math.round(communicationScore * 0.9);

    const hardQuestions = answered.filter((q) => q.difficulty === 'HARD');
    const problemSolvingScore =
      hardQuestions.length > 0
        ? scoreToPercent(
            hardQuestions.reduce((s, q) => s + (q.answer!.score ?? 5), 0) / hardQuestions.length
          )
        : technicalScore;

    const scores: FeedbackScores = {
      overallScore: 0,
      technicalScore,
      communicationScore,
      confidenceScore,
      problemSolvingScore,
      resumeMatchScore,
      behavioralScore,
    };

    scores.overallScore = computeOverallScore(scores);
    const overallScore = scores.overallScore;

    const domain = interview.domain ?? 'BACKEND_DEVELOPER';
    const domainLabel = DOMAIN_LABELS[domain] ?? domain;

    const qaPairs = answered.map((q) => ({
      question: q.questionText,
      answer: q.answer!.answerText,
      score: q.answer!.score ?? 5,
      category: q.category ?? undefined,
    }));

    const aiFeedback = await llmService.generateInterviewFeedback({
      domain,
      domainLabel,
      difficulty: interview.difficulty,
      qaPairs,
      scores,
      resumeUsed: !!interview.resumeId,
    });

    const perQuestionScores = answered.map((q) => ({
      questionId: q.id,
      question: q.questionText.slice(0, 100),
      score: q.answer!.score ?? 0,
      category: q.category,
    }));

    const aggregatedCamera = aggregateCameraMetrics(cameraMetricsList);

    const reportData = {
      scores,
      perQuestionScores,
      domain,
      domainLabel,
      difficulty: interview.difficulty,
      questionCount: answered.length,
      generatedAt: new Date().toISOString(),
    };

    const feedback = await prisma.interviewFeedback.create({
      data: {
        interviewId,
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        problemSolvingScore,
        resumeMatchScore,
        behavioralScore,
        strengths: aiFeedback.strengths,
        weaknesses: aiFeedback.weaknesses,
        topicsToImprove: aiFeedback.topicsToImprove,
        learningResources: aiFeedback.learningResources as object,
        performanceSummary: aiFeedback.performanceSummary,
        cameraMetrics: aggregatedCamera as object,
        reportData: reportData as object,
      },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'FEEDBACK_GENERATED',
        entityType: 'InterviewFeedback',
        entityId: feedback.id,
        metadata: { overallScore },
      },
    });

    return feedback;
  }

  async get(userId: string, interviewId: string) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId },
      include: {
        feedback: true,
        questions: { orderBy: { orderIndex: 'asc' }, include: { answer: true } },
        resume: { select: { title: true } },
      },
    });

    if (!interview) throw new AppError(404, 'Interview not found');
    if (!interview.feedback) throw new AppError(404, 'Feedback not generated yet');

    return { interview, feedback: interview.feedback };
  }

  async generateReportHtml(userId: string, interviewId: string): Promise<string> {
    const { interview, feedback } = await this.get(userId, interviewId);
    const domainLabel = DOMAIN_LABELS[interview.domain ?? ''] ?? interview.domain ?? 'Interview';

    const scoreRows = [
      ['Overall', feedback.overallScore],
      ['Technical', feedback.technicalScore],
      ['Communication', feedback.communicationScore],
      ['Confidence', feedback.confidenceScore],
      ['Problem Solving', feedback.problemSolvingScore],
      ['Resume Match', feedback.resumeMatchScore],
      ['Behavioral', feedback.behavioralScore],
    ]
      .map(
        ([label, score]) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${label}</td>
         <td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${score}%</td></tr>`
      )
      .join('');

    const strengths = (feedback.strengths as string[]) ?? [];
    const weaknesses = (feedback.weaknesses as string[]) ?? [];
    const topics = (feedback.topicsToImprove as string[]) ?? [];
    const resources =
      (feedback.learningResources as Array<{ title: string; url: string; type: string }>) ?? [];

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Interview Report</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e}
h1{color:#4f46e5}.score{font-size:48px;font-weight:bold;color:#4f46e5}
table{width:100%;border-collapse:collapse;margin:20px 0}
.section{margin:24px 0}ul{line-height:1.8}
.tag{display:inline-block;background:#ede9fe;color:#4f46e5;padding:4px 12px;border-radius:20px;margin:4px;font-size:13px}
</style></head><body>
<h1>Interview Performance Report</h1>
<p><strong>Domain:</strong> ${domainLabel} | <strong>Difficulty:</strong> ${interview.difficulty}</p>
<p><strong>Generated:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
<div class="score">${Math.round(feedback.overallScore)}%</div>
<p>Overall Performance Score</p>

<div class="section"><h2>Score Breakdown</h2>
<table><thead><tr><th>Category</th><th>Score</th></tr></thead><tbody>${scoreRows}</tbody></table></div>

<div class="section"><h2>Performance Summary</h2><p>${feedback.performanceSummary ?? ''}</p></div>

<div class="section"><h2>Strengths</h2><ul>${strengths.map((s) => `<li>${s}</li>`).join('')}</ul></div>
<div class="section"><h2>Weaknesses</h2><ul>${weaknesses.map((w) => `<li>${w}</li>`).join('')}</ul></div>
<div class="section"><h2>Topics to Improve</h2><ul>${topics.map((t) => `<li>${t}</li>`).join('')}</ul></div>

<div class="section"><h2>Recommended Resources</h2>
${resources.map((r) => `<p><strong>${r.title}</strong> (${r.type}) — <a href="${r.url}">${r.url}</a></p>`).join('')}
</div>

<p style="margin-top:40px;color:#888;font-size:12px">Generated by AI Interviewer Platform</p>
</body></html>`;
  }

  async generateReportPdf(userId: string, interviewId: string): Promise<Buffer> {
    const { feedback } = await this.get(userId, interviewId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).fillColor('#4f46e5').text('Interview Performance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(48).fillColor('#4f46e5').text(`${Math.round(feedback.overallScore)}%`, { align: 'center' });
      doc.fontSize(12).fillColor('#666').text('Overall Score', { align: 'center' });
      doc.moveDown(2).fillColor('#000');

      const rows: [string, number][] = [
        ['Technical', feedback.technicalScore],
        ['Communication', feedback.communicationScore],
        ['Confidence', feedback.confidenceScore],
        ['Problem Solving', feedback.problemSolvingScore],
        ['Resume Match', feedback.resumeMatchScore],
        ['Behavioral', feedback.behavioralScore],
      ];

      doc.fontSize(14).text('Score Breakdown', { underline: true });
      doc.moveDown(0.5);
      for (const [label, score] of rows) {
        doc.fontSize(11).text(`${label}: ${Math.round(score)}%`);
      }

      doc.moveDown();
      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.5).fontSize(10).text(feedback.performanceSummary ?? '', { lineGap: 4 });

      const strengths = (feedback.strengths as string[]) ?? [];
      if (strengths.length) {
        doc.moveDown().fontSize(14).text('Strengths', { underline: true });
        doc.moveDown(0.5).fontSize(10);
        strengths.forEach((s) => doc.text(`• ${s}`));
      }

      doc.end();
    });
  }
}

export const feedbackService = new FeedbackService();
