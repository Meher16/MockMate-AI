import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { feedbackService } from '../services/feedback.service';
import { asyncHandler } from '../utils/error.utils';

export const generateFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const feedback = await feedbackService.generate(req.user!.userId, req.params.id);
  res.status(201).json({
    success: true,
    message: 'Feedback generated successfully',
    data: { feedback },
  });
});

export const getFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await feedbackService.get(req.user!.userId, req.params.id);
  res.json({ success: true, data: result });
});

export const downloadFeedbackHtml = asyncHandler(async (req: AuthRequest, res: Response) => {
  const html = await feedbackService.generateReportHtml(req.user!.userId, req.params.id);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="interview-report-${req.params.id}.html"`);
  res.send(html);
});

export const downloadFeedbackPdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pdf = await feedbackService.generateReportPdf(req.user!.userId, req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="interview-report-${req.params.id}.pdf"`);
  res.send(pdf);
});
