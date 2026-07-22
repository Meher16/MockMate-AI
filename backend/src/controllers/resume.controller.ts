import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { resumeService } from '../services/resume.service';
import { asyncHandler, AppError } from '../utils/error.utils';
import { sanitizeFilename } from '../utils/file.utils';

export const listResumes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resumes = await resumeService.listByUser(req.user!.userId);
  res.json({ success: true, data: { resumes } });
});

export const getResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resume = await resumeService.getById(req.user!.userId, req.params.id);
  res.json({ success: true, data: { resume } });
});

export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  const title = req.body.title as string | undefined;
  const resume = await resumeService.upload(req.user!.userId, req.file, title);

  res.status(201).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: { resume },
  });
});

export const updateResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resume = await resumeService.update(req.user!.userId, req.params.id, req.body);
  res.json({
    success: true,
    message: 'Resume updated successfully',
    data: { resume },
  });
});

export const deleteResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  await resumeService.delete(req.user!.userId, req.params.id);
  res.json({ success: true, message: 'Resume deleted successfully' });
});

export const downloadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filePath, fileName } = await resumeService.getFilePath(req.user!.userId, req.params.id);
  res.download(filePath, sanitizeFilename(fileName));
});

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await resumeService.getDashboardStats(req.user!.userId);
  res.json({ success: true, data: { stats } });
});
