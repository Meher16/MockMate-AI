import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { resumeBuilderService } from '../services/resume-builder.service';
import { asyncHandler } from '../utils/error.utils';

export const createBuilderResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, builderData } = req.body;
  const resume = await resumeBuilderService.create(req.user!.userId, title, builderData);

  res.status(201).json({
    success: true,
    message: 'Resume created successfully',
    data: { resume },
  });
});

export const updateBuilderResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, builderData } = req.body;
  const resume = await resumeBuilderService.update(
    req.user!.userId,
    req.params.id,
    title,
    builderData
  );

  res.json({
    success: true,
    message: 'Resume updated successfully',
    data: { resume },
  });
});

export const exportResumeHtml = asyncHandler(async (req: AuthRequest, res: Response) => {
  const html = await resumeBuilderService.exportHtml(req.user!.userId, req.params.id);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="resume-${req.params.id}.html"`);
  res.send(html);
});

export const exportResumePdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pdf = await resumeBuilderService.exportPdf(req.user!.userId, req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="resume-${req.params.id}.pdf"`);
  res.send(pdf);
});

export const previewResumeHtml = asyncHandler(async (req: AuthRequest, res: Response) => {
  const html = await resumeBuilderService.exportHtml(req.user!.userId, req.params.id);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
