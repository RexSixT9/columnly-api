import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Like from '@/models/like';

import type { Request, Response } from 'express';

export const unLikeBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const existingLike = await Like.findOne({
      blogId,
      userId,
    })
      .lean()
      .exec();

    if (!existingLike) {
      res.status(400).json({
        code: 'NotLiked',
        message: 'You have not liked this blog',
      });
      return;
    }

    await Like.deleteOne({ _id: existingLike._id });

    const blog = await Blog.findById(blogId).select('likesCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    blog.likesCount--;
    await blog.save();

    logger.info(`User ${userId} unliked blog ${blogId}`);

    res.status(200).json({
      code: 'BlogUnliked',
      message: 'Blog unliked successfully',
    });
  } catch (error) {
    logger.error('Error unliking blog', { error });
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while unliking the blog',
    });
  }
};
