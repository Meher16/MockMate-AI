import { Router } from 'express';
import {
  analyzeResume,
  listAtsScores,
  getAtsScore,
  downloadAtsReport,
  getLatestAtsForResume,
} from '../controllers/ats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listAtsScores);
router.get('/resume/:resumeId/latest', getLatestAtsForResume);
router.post('/analyze/:resumeId', analyzeResume);
router.get('/:id/report', downloadAtsReport);
router.get('/:id', getAtsScore);

export default router;
