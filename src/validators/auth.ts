import { refine, z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ message: 'Email is required and must be valid' })
    .trim()
    .min(1, 'Email is required and must be valid')
    .max(50, 'Email must be less than 50 characters long')
    .toLowerCase()
    .email('Email must be a valid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['user', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required and must be valid' })
    .trim()
    .min(1, 'Email is required and must be valid')
    .max(50, 'Email must be less than 50 characters long')
    .toLowerCase()
    .email('Email must be a valid email address'),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
