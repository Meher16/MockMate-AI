import { z } from 'zod';

const interviewDomainEnum = z.enum([
  'FRONTEND_DEVELOPER',
  'BACKEND_DEVELOPER',
  'JAVA_DEVELOPER',
  'PYTHON_DEVELOPER',
  'MERN_STACK',
  'DATA_SCIENCE',
  'MACHINE_LEARNING',
  'DEVOPS',
  'UI_UX',
  'HR',
  'MARKETING',
]);

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const createInterviewSchema = z.object({
  resumeId: z.string().optional(),
  domain: interviewDomainEnum,
  difficulty: difficultyEnum.default('MEDIUM'),
  durationMinutes: z.number().int().min(5).max(120).default(20),
  questionCount: z.number().int().min(1).max(30).default(10),
});

export const submitAnswerSchema = z.object({
  answerText: z.string().min(1, 'Answer is required').max(10000),
  transcription: z.string().max(10000).optional(),
  timeTakenSec: z.number().int().min(0).optional(),
  cameraMetrics: z
    .object({
      samples: z.number(),
      avgEyeContact: z.number(),
      lookingAwayCount: z.number(),
      multipleFacesCount: z.number(),
      avgFaceVisibility: z.number(),
      avgHeadStability: z.number(),
    })
    .optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
