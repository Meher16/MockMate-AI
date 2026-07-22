import { Router } from 'express';
import {
  createInterview,
  listInterviews,
  getInterview,
  startInterview,
  getCurrentQuestion,
  submitAnswer,
  cancelInterview,
  getInterviewStats,
} from '../controllers/interview.controller';
import {
  generateFeedback,
  getFeedback,
  downloadFeedbackHtml,
  downloadFeedbackPdf,
} from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../utils/error.utils';
import { createInterviewSchema, submitAnswerSchema } from '../validators/interview.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', getInterviewStats);
router.get('/', listInterviews);
router.post('/', validateBody(createInterviewSchema), createInterview);
router.get('/:id', getInterview);
router.post('/:id/start', startInterview);
router.get('/:id/current', getCurrentQuestion);
router.post('/:id/questions/:questionId/answer', validateBody(submitAnswerSchema), submitAnswer);
router.post('/:id/cancel', cancelInterview);
router.post('/:id/feedback/generate', generateFeedback);
router.get('/:id/feedback/report/html', downloadFeedbackHtml);
router.get('/:id/feedback/report/pdf', downloadFeedbackPdf);
router.get('/:id/feedback', getFeedback);

export default router;
