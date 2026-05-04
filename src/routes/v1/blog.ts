import { Router } from 'express';
import multer from 'multer';

// middlewares
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import { validationErrorHandler } from '@/middlewares/validationError';
import { blogQuerySchema, createBlogSchema } from '@/validators/blog';

// controllers
import createBlog from '@/controllers/v1/blog/create_blog';
import getAllBlogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogsByUserId from '@/controllers/v1/blog/get_blogs_by_user';

const upload = multer();

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  upload.single('banner_image'),
  uploadBlogBanner('post'),
  validationErrorHandler(createBlogSchema),
  createBlog,
);

router.get(
  '/',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogQuerySchema),
  getAllBlogs,
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(['admin', 'user']),
  getBlogsByUserId,
);

export default router;
