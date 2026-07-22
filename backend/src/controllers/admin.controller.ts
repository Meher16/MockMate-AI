import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { adminService } from '../services/admin.service';
import { asyncHandler, AppError } from '../utils/error.utils';

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await adminService.getStats();
  res.json({ success: true, data: stats });
});

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await adminService.getUsers();
  res.json({ success: true, data: users });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    throw new AppError(400, 'User ID is required');
  }

  try {
    await adminService.deleteUser(id, req.user!.userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to delete user');
  }
});

export const getInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const interviews = await adminService.getInterviews();
  res.json({ success: true, data: interviews });
});
