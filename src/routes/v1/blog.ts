import { Router } from 'express';
import multer from 'multer';

// middlewares
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import  validationErrorHandler  from '@/middlewares/validationErrorHandler';
import {
  blogIdParamSchema,
  blogQuerySchema,
  createBlogSchema,
  updateBlogSchema,
} from '@/validators/blog';
import { userIdParamSchema } from '@/validators/user';

// controllers
import createBlog from '@/controllers/v1/blog/create_blog';
import getAllBlogs from '@/controllers/v1/blog/get_all_blogs';
import getBlogsByUserId from '@/controllers/v1/blog/get_blogs_by_user';
import getBlogsBySlug from '@/controllers/v1/blog/get_blogs_by_slug';
import updateBlog from '@/controllers/v1/blog/update_blog';
import { deleteBlog } from '@/controllers/v1/blog/delete_blog';

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
  validationErrorHandler(userIdParamSchema, 'params'),
  validationErrorHandler(blogQuerySchema),
  getBlogsByUserId,
);

router.get(
  '/:slug',
  authenticate,
  authorize(['admin', 'user']),
  getBlogsBySlug,
);

router.put(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  upload.single('banner_image'),
  uploadBlogBanner('put'),
  validationErrorHandler(updateBlogSchema),
  updateBlog,
);

router.delete(
  '/:blogId',
  authenticate,
  authorize(['admin']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  deleteBlog,
);

export default router;
