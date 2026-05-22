import { Types } from 'mongoose';
import { z } from 'zod';

const bannerSchema = z.object({
  url: z.string().url('Banner URL must be a valid URL'),
  publicId: z.string().min(1, 'Banner public ID is required'),
  width: z
    .number()
    .int('Banner width must be an integer')
    .positive('Banner width must be a positive number'),
  height: z
    .number()
    .int('Banner height must be an integer')
    .positive('Banner height must be a positive number'),
});

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(180, 'Title must be less than 180 characters'),
  content: z.string().trim().min(1, 'Content is required'),
  status: z
    .enum(['draft', 'published'], {
      message: 'Status must be one of the value, draft or published',
    })
    .optional(),
  banner: bannerSchema,
});

export const blogIdParamSchema = z.object({
  blogId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid blog ID',
    })
    .transform((val) => new Types.ObjectId(val)),
});

export const updateBlogSchema = z
  .object({
    title: z.string().trim().min(1).max(180).optional(),
    content: z.string().trim().min(1).optional(),
    status: z.enum(['draft', 'published']).optional(),
    banner: bannerSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });



export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;