import { Types } from 'mongoose';
import { z } from 'zod';

import User from '@/models/user';

const urlField = z
  .string()
  .url('Invalid URL')
  .max(100, 'Website URL must be less than 100 characters')
  .optional();

const userIdField = z
  .string()
  .trim()
  .min(1, 'User ID is required')
  .refine((value) => Types.ObjectId.isValid(value), {
    message: 'Invalid user ID',
  });

export const userIdParamSchema = z.object({
  userId: userIdField,
});

export const updateCurrentUserSchema = (userId?: Types.ObjectId) =>
  z
    .object({
      username: z
        .string()
        .trim()
        .max(20, 'Username must be less than 20 characters')
        .optional()
        .refine(
          async (value) => {
            if (!value) return true;
            const exists = await User.exists({
              username: value,
              ...(userId ? { _id: { $ne: userId } } : {}),
            });
            return !exists;
          },
          { message: 'This username is already in use' },
        ),
      email: z
        .string()
        .trim()
        .max(50, 'Email must be less than 50 characters')
        .toLowerCase()
        .email('Invalid email address')
        .optional()
        .refine(
          async (value) => {
            if (!value) return true;
            const exists = await User.exists({
              email: value,
              ...(userId ? { _id: { $ne: userId } } : {}),
            });
            return !exists;
          },
          { message: 'This email is already in use' },
        ),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .optional(),
      first_name: z
        .string()
        .max(20, 'First name must be less than 20 characters')
        .optional(),
      last_name: z
        .string()
        .max(20, 'Last name must be less than 20 characters')
        .optional(),
      website: urlField,
      facebook: urlField,
      instagram: urlField,
      x: urlField,
      youtube: urlField,
    });

export type UpdateCurrentUserInput = z.infer<ReturnType<
  typeof updateCurrentUserSchema
>>;
