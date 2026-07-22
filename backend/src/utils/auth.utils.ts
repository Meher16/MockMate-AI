import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export function sanitizeUser<T extends { password?: string; refreshToken?: string | null }>(
  user: T
): Omit<T, 'password' | 'refreshToken'> {
  const { password: _password, refreshToken: _refreshToken, ...safeUser } = user;
  return safeUser;
}
