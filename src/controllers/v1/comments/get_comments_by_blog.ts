import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Comment from '@/models/comment';

import type { Request, Response } from 'express';

export const getCommentsByBlog = async (req: Request, res: Response): Promise<void> => {

  const { slug } = req.params;
  try {
    const blog = await Blog.findOne({ slug }).select('_id').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found!',
      });
      return;
    }

    const allComments = await Comment.find({ blog: blog._id })
      .populate('blog', 'banner.url title slug')
      .populate('user', 'username firstName lastName')
      .lean()
      .exec();
  
    if (!allComments || allComments.length === 0) {
      res.status(404).json({
        code: 'CommentsNotFound',
        message: 'No comments found for this blog',
      });
      return;
    }

    res.status(200).json({
      code: 'CommentsFound',
      message: 'Comments found successfully',
      comments: allComments,
    });
  } catch (err) {
    logger.error(`Error in getCommentsByBlog: ${err}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while fetching comments',
    });
  }
};
