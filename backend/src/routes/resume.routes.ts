import { Router } from 'express';
import {
  listResumes,
  getResume,
  uploadResume,
  updateResume,
  deleteResume,
  downloadResume,
  getDashboardStats,
} from '../controllers/resume.controller';
import {
  createBuilderResume,
  updateBuilderResume,
  exportResumeHtml,
  exportResumePdf,
  previewResumeHtml,
} from '../controllers/resume-builder.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadResume as uploadMiddleware } from '../middleware/upload.middleware';
import { validateBody } from '../utils/error.utils';
import { updateResumeSchema } from '../validators/resume.validator';
import {
  createBuilderResumeSchema,
  updateBuilderResumeSchema,
} from '../validators/resume-builder.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/', listResumes);
router.post('/upload', uploadMiddleware.single('resume'), uploadResume);
router.post('/builder', validateBody(createBuilderResumeSchema), createBuilderResume);
router.get('/:id/export/html', exportResumeHtml);
router.get('/:id/export/pdf', exportResumePdf);
router.get('/:id/preview', previewResumeHtml);
router.put('/:id/builder', validateBody(updateBuilderResumeSchema), updateBuilderResume);
router.get('/:id/download', downloadResume);
router.get('/:id', getResume);
router.put('/:id', validateBody(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);

export default router;
