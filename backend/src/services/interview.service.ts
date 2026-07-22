import { DifficultyLevel, InterviewDomain, InterviewStatus } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../utils/error.utils';
import { llmService } from './ai/llm.service';
import { DOMAIN_LABELS } from './ai/llm.types';
import { feedbackService } from './feedback.service';

export interface CreateInterviewInput {
  resumeId?: string;
  domain: InterviewDomain;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questionCount: number;
}

export interface SubmitAnswerInput {
  answerText: string;
  transcription?: string;
  timeTakenSec?: number;
  cameraMetrics?: {
    samples: number;
    avgEyeContact: number;
    lookingAwayCount: number;
    multipleFacesCount: number;
    avgFaceVisibility: number;
    avgHeadStability: number;
  };
}

export class InterviewService {
  async create(userId: string, input: CreateInterviewInput) {
    if (input.questionCount < 1 || input.questionCount > 30) {
      throw new AppError(400, 'Question count must be between 1 and 30');
    }

    if (input.durationMinutes < 5 || input.durationMinutes > 120) {
      throw new AppError(400, 'Duration must be between 5 and 120 minutes');
    }

    if (input.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: input.resumeId, userId },
      });
      if (!resume) throw new AppError(404, 'Resume not found');
    }

    const interview = await prisma.interview.create({
      data: {
        userId,
        resumeId: input.resumeId ?? null,
        domain: input.domain,
        difficulty: input.difficulty,
        durationMinutes: input.durationMinutes,
        questionCount: input.questionCount,
        status: InterviewStatus.PENDING,
      },
      include: { resume: { select: { id: true, title: true } } },
    });

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'INTERVIEW_CREATED',
        entityType: 'Interview',
        entityId: interview.id,
        metadata: { domain: input.domain, difficulty: input.difficulty },
      },
    });

    return interview;
  }

  async list(userId: string) {
    return prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: { select: { id: true, title: true } },
        questions: { select: { id: true }, where: { answer: { isNot: null } } },
        feedback: { select: { overallScore: true } },
      },
    });
  }

  async getById(userId: string, interviewId: string) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId },
      include: {
        resume: { select: { id: true, title: true, rawText: true } },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
        feedback: true,
      },
    });

    if (!interview) throw new AppError(404, 'Interview not found');
    return interview;
  }

  async start(userId: string, interviewId: string) {
    const interview = await this.getById(userId, interviewId);

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new AppError(400, 'Interview already completed');
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      throw new AppError(400, 'Interview was cancelled');
    }

    if (interview.status === InterviewStatus.IN_PROGRESS && interview.questions.length > 0) {
      const current = interview.questions.find((q) => !q.answer);
      return { interview, currentQuestion: current ?? null };
    }

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: InterviewStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    const firstQuestion = await this.generateNextQuestion(interviewId, interview);

    await prisma.userHistory.create({
      data: {
        userId,
        action: 'INTERVIEW_STARTED',
        entityType: 'Interview',
        entityId: interviewId,
      },
    });

    return { interview: updated, currentQuestion: firstQuestion };
  }

  async getCurrentQuestion(userId: string, interviewId: string) {
    const interview = await this.getById(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new AppError(400, 'Interview is not in progress');
    }

    const current = interview.questions.find((q) => !q.answer);
    const answeredCount = interview.questions.filter((q) => q.answer).length;

    return {
      interview,
      currentQuestion: current ?? null,
      answeredCount,
      totalQuestions: interview.questionCount,
      isComplete: !current,
    };
  }

  async submitAnswer(userId: string, interviewId: string, questionId: string, input: SubmitAnswerInput) {
    const interview = await this.getById(userId, interviewId);

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      throw new AppError(400, 'Interview is not in progress');
    }

    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) throw new AppError(404, 'Question not found');
    if (question.answer) throw new AppError(400, 'Question already answered');

    if (!input.answerText.trim()) {
      throw new AppError(400, 'Answer cannot be empty');
    }

    const domain = interview.domain ?? 'BACKEND_DEVELOPER';

    const analysis = await llmService.analyzeAnswer({
      question: question.questionText,
      answer: input.answerText,
      domain,
      difficulty: question.difficulty,
    });

    const answer = await prisma.answer.create({
      data: {
        questionId,
        answerText: input.answerText.trim(),
        transcription: input.transcription?.trim() || null,
        analysis: {
          ...analysis,
          ...(input.cameraMetrics ? { cameraMetrics: input.cameraMetrics } : {}),
        } as object,
        score: analysis.score,
        timeTakenSec: input.timeTakenSec,
      },
    });

    const answeredCount = interview.questions.filter((q) => q.answer).length + 1;
    const isComplete = answeredCount >= interview.questionCount;

    let nextQuestion = null;

    if (!isComplete) {
      const refreshed = await this.getById(userId, interviewId);
      nextQuestion = await this.generateNextQuestion(interviewId, refreshed, analysis.suggestedDifficulty);
    } else {
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: InterviewStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'INTERVIEW_COMPLETED',
          entityType: 'Interview',
          entityId: interviewId,
        },
      });

      try {
        await feedbackService.generate(userId, interviewId);
      } catch (error) {
        console.warn('Auto feedback generation failed:', error);
      }
    }

    return {
      answer,
      analysis,
      nextQuestion,
      answeredCount,
      totalQuestions: interview.questionCount,
      isComplete,
      adjustedDifficulty: analysis.suggestedDifficulty,
    };
  }

  async cancel(userId: string, interviewId: string) {
    const interview = await this.getById(userId, interviewId);

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new AppError(400, 'Cannot cancel completed interview');
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: InterviewStatus.CANCELLED },
    });

    return { message: 'Interview cancelled' };
  }

  private async generateNextQuestion(
    interviewId: string,
    interview: Awaited<ReturnType<InterviewService['getById']>>,
    suggestedDifficulty?: DifficultyLevel | string
  ) {
    const orderIndex = interview.questions.length;
    const domain = interview.domain ?? 'BACKEND_DEVELOPER';
    const domainLabel = DOMAIN_LABELS[domain] ?? domain;

    let difficulty = interview.difficulty;
    if (suggestedDifficulty && ['EASY', 'MEDIUM', 'HARD'].includes(suggestedDifficulty)) {
      difficulty = suggestedDifficulty as DifficultyLevel;
    }

    const previousQuestions = interview.questions.map((q) => q.questionText);
    const previousAnswers = interview.questions
      .filter((q) => q.answer)
      .map((q) => ({
        question: q.questionText,
        answer: q.answer!.answerText,
        score: q.answer!.score ?? undefined,
      }));

    const resumeContext = interview.resume?.rawText ?? undefined;

    const generated = await llmService.generateQuestion({
      domain,
      domainLabel,
      difficulty,
      resumeContext,
      previousQuestions,
      previousAnswers,
      questionNumber: orderIndex + 1,
      totalQuestions: interview.questionCount,
    });

    return prisma.question.create({
      data: {
        interviewId,
        orderIndex,
        questionText: generated.questionText,
        category: generated.category,
        difficulty: generated.difficulty as DifficultyLevel,
      },
    });
  }
}

export const interviewService = new InterviewService();
