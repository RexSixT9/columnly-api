import { Router } from 'express';

import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { validationErrorHandler } from '@/middlewares/validationError';
import { createComments } from '@/controllers/v1/comments/create_comment';
import { blogIdParamSchema } from '@/validators/blog';
import { getCommentsByBlog } from '@/controllers/v1/comments/get_comments_by_blog';
import { deleteComment } from '@/controllers/v1/comments/delete_comment';
import { commentIdParamSchema } from '@/validators/comment';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  createComments,
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  getCommentsByBlog,
);

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(commentIdParamSchema, 'params'),
  deleteComment,
);

export default router;
