import { z } from 'zod';

const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string().max(30).optional().default(''),
  location: z.string().max(100).optional().default(''),
  linkedIn: z.string().max(200).optional().default(''),
  website: z.string().max(200).optional().default(''),
  jobTitle: z.string().max(100).optional().default(''),
});

const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().default(''),
  current: z.boolean().default(false),
  description: z.string().optional().default(''),
});

const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().default(''),
  gpa: z.string().optional().default(''),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  url: z.string().optional().default(''),
  technologies: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

const certificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional().default(''),
  date: z.string().optional().default(''),
});

const languageSchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required'),
  proficiency: z.string().optional().default(''),
});

export const resumeBuilderDataSchema = z.object({
  template: z.enum(['classic', 'modern', 'minimal']).default('modern'),
  personalInfo: personalInfoSchema,
  summary: z.string().max(2000).optional().default(''),
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  achievements: z.array(z.string()).default([]),
});

export const createBuilderResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  builderData: resumeBuilderDataSchema,
});

export const updateBuilderResumeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  builderData: resumeBuilderDataSchema,
});

export type ResumeBuilderDataInput = z.infer<typeof resumeBuilderDataSchema>;
