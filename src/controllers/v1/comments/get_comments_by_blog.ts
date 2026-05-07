import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Comment from '@/models/comment';

import type { Request, Response } from 'express';
import type { IComment } from '@/models/comment';

export const getCommentsByBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params as { blogId: string };

    const blog = await Blog.findById(blogId).select('_id').lean().exec();
    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    const comments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!comments || comments.length === 0) {
      res.status(404).json({
        code: 'CommentsNotFound',
        message: 'No comments found for this blog',
      });
      return;
    }

    res.status(200).json({
      code: 'CommentsFound',
      message: 'Comments found successfully',
      data: comments,
    });
  } catch (err) {
    logger.error(`Error in getCommentsByBlog: ${err}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while fetching comments',
    });
  }
};
