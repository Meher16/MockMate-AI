import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { interviewService } from '../services/interview.service';
import { asyncHandler } from '../utils/error.utils';

export const createInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interview = await interviewService.create(req.user!.userId, req.body);
  res.status(201).json({ success: true, message: 'Interview created', data: { interview } });
});

export const listInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await interviewService.list(req.user!.userId);
  res.json({ success: true, data: { interviews } });
});

export const getInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interview = await interviewService.getById(req.user!.userId, req.params.id);
  res.json({ success: true, data: { interview } });
});

export const startInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await interviewService.start(req.user!.userId, req.params.id);
  res.json({ success: true, message: 'Interview started', data: result });
});

export const getCurrentQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await interviewService.getCurrentQuestion(req.user!.userId, req.params.id);
  res.json({ success: true, data: result });
});

export const submitAnswer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await interviewService.submitAnswer(
    req.user!.userId,
    req.params.id,
    req.params.questionId,
    req.body
  );
  res.json({ success: true, message: result.isComplete ? 'Interview completed' : 'Answer submitted', data: result });
});

export const cancelInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await interviewService.cancel(req.user!.userId, req.params.id);
  res.json({ success: true, data: result });
});

export const getInterviewStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await interviewService.list(req.user!.userId);
  const completed = interviews.filter((i) => i.status === 'COMPLETED');
  const scores = completed
    .map((i) => i.feedback?.overallScore)
    .filter((s): s is number => s != null);

  res.json({
    success: true,
    data: {
      stats: {
        totalInterviews: interviews.length,
        completedInterviews: completed.length,
        averageScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
        recentInterviews: interviews.slice(0, 5),
      },
    },
  });
});
