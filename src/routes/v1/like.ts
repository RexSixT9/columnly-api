import { Router } from 'express';

import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';

import validationErrorHandler from '@/middlewares/validationErrorHandler';
import { blogIdParamSchema } from '@/validators/blog';

import { likeBlog } from '@/controllers/v1/like/like_blog';
import { unLikeBlog } from '@/controllers/v1/like/unlike_blog';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  likeBlog,
);

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  unLikeBlog,
);

export default router;
