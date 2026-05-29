import { Router } from 'express';

import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import validationErrorHandler from '@/middlewares/validationErrorHandler';
import { createComments } from '@/controllers/v1/comments/create_comment';
import { blogIdParamSchema } from '@/validators/blog';
import { getCommentsByBlog } from '@/controllers/v1/comments/get_comments_by_blog';
import { deleteComment } from '@/controllers/v1/comments/delete_comment';
import { commentIdParamSchema } from '@/validators/comment';
import getComments from '@/controllers/v1/comments/get_comments';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(blogIdParamSchema, 'params'),
  createComments,
);

router.get('/', authenticate, authorize(['admin']), getComments);

// router.get(
//   '/blog/:blogId',
//   authenticate,
//   authorize(['admin', 'user']),
//   validationErrorHandler(blogIdParamSchema, 'params'),
//   getCommentsByBlog,
// );

router.get(
  '/blog/:slug', // Route to get all comments associate with the specific blog post
  getCommentsByBlog, // Controller function that handles the "get comment" logic
);

router.delete(
  '/:commentId',
  authenticate,
  authorize(['admin', 'user']),
  validationErrorHandler(commentIdParamSchema, 'params'),
  deleteComment,
);


export default router;
