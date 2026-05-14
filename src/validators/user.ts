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
