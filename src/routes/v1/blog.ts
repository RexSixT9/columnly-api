import { Router } from 'express';
import { query, param } from 'express-validator';
import multer from 'multer';

// middlewares
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import uploadBlogBanner from '@/middlewares/uploadBlogBanner';
import validationErrorHandler from '@/middlewares/validationErrorHandler';
import {
  blogIdParamSchema,
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
import { validationError } from '@/middlewares/validationError';

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
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a positive integer'),
  validationError,
  getAllBlogs,
);

router.get(
  '/user/:userId',
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a positive integer'),
  validationError,
  getBlogsByUserId,
);

// router.get(
//   '/',
//   authenticate,
//   authorize(['admin', 'user']),
//   validationErrorHandler(blogQuerySchema),
//   getAllBlogs,
// );

// router.get(
//   '/user/:userId',
//   authenticate,
//   authorize(['admin', 'user']),
//   validationErrorHandler(userIdParamSchema, 'params'),
//   validationErrorHandler(blogQuerySchema),
//   getBlogsByUserId,
// );

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
