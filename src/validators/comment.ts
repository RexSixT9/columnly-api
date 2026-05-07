import { Types } from 'mongoose';
import { z } from 'zod';

export const commentIdParamSchema = z.object({
  commentId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid comment ID',
    })
    .transform((val) => new Types.ObjectId(val)),
});

export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
