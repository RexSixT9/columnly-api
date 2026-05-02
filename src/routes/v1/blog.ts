import { Router } from 'express';
import multer from 'multer';

// middlewares
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import { validationErrorHandler } from '@/middlewares/validationError';
import { createBlogSchema } from '@/validators/blog';

// controllers
import { createBlog } from '@/controllers/v1/blog/create_blog';

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

export default router;
