import { Router } from 'express';
import authRoutes from './auth.routes';
import resumeRoutes from './resume.routes';
import atsRoutes from './ats.routes';
import interviewRoutes from './interview.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ats', atsRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AI Interviewer API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
