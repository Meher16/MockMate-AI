import { Response } from 'express';
import config from '../config';
import { AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/error.utils';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, COOKIE_OPTIONS);
}

function clearAuthCookie(res: Response): void {
  res.clearCookie('token', { path: '/' });
}

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.register(req.body);
  setAuthCookie(res, result.token);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result,
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.login(req.body);
  setAuthCookie(res, result.token);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.userId) {
    await authService.logout(req.user.userId);
  }
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);

  res.json({
    success: true,
    data: { user },
  });
});
