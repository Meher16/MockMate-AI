import { describe, expect, it } from 'vitest';
import { sanitizeUser, signAccessToken, verifyAccessToken } from './auth.utils';

describe('sanitizeUser', () => {
  it('removes password and refreshToken from user object', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed',
      refreshToken: 'token',
      firstName: 'Test',
    };

    const safe = sanitizeUser(user);

    expect(safe).toEqual({
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
    });
    expect(safe).not.toHaveProperty('password');
    expect(safe).not.toHaveProperty('refreshToken');
  });
});

describe('JWT helpers', () => {
  it('signs and verifies access tokens', () => {
    const payload = { userId: 'user-1', email: 'test@example.com', role: 'USER' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});
