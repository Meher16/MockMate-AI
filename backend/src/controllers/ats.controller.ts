import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { atsService } from '../services/ats-db.service';
import { asyncHandler } from '../utils/error.utils';
import prisma from '../config/database';

export const analyzeResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await atsService.analyze(req.user!.userId, req.params.resumeId);
  res.json({
    success: true,
    message: 'ATS analysis completed',
    data: result,
  });
});

export const listAtsScores = asyncHandler(async (req: AuthRequest, res: Response) => {
  const scores = await atsService.listScores(req.user!.userId);
  res.json({ success: true, data: { scores } });
});

export const getAtsScore = asyncHandler(async (req: AuthRequest, res: Response) => {
  const score = await atsService.getScore(req.user!.userId, req.params.id);
  res.json({ success: true, data: { score } });
});

export const downloadAtsReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { firstName: true, lastName: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Candidate';
  const html = await atsService.generateReport(req.user!.userId, req.params.id, userName);

  res.setHeader('Content-Type', 'text/html');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ats-report-${req.params.id}.html"`
  );
  res.send(html);
});

export const getLatestAtsForResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const score = await atsService.getLatestForResume(req.user!.userId, req.params.resumeId);
  res.json({ success: true, data: { score } });
});
