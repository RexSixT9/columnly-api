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

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
