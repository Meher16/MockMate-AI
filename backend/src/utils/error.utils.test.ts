import { describe, expect, it, vi } from 'vitest';
import { ZodError, z } from 'zod';
import { AppError, errorHandler } from './error.utils';

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe('errorHandler', () => {
  it('handles AppError with status code', () => {
    const res = createMockResponse();
    errorHandler(new AppError(404, 'Not found'), {} as never, res as never, vi.fn());

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ success: false, message: 'Not found' });
  });

  it('handles Zod validation errors', () => {
    const res = createMockResponse();
    let zodError: ZodError;

    try {
      z.object({ email: z.string().email() }).parse({ email: 'invalid' });
    } catch (error) {
      zodError = error as ZodError;
    }

    errorHandler(zodError!, {} as never, res as never, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Validation failed',
    });
  });
});
