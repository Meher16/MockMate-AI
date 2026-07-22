import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/error.utils';

export const getDashboardAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const analytics = await analyticsService.getDashboardAnalytics(req.user!.userId);
  res.json({ success: true, data: { analytics } });
});
