import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Like from '@/models/like';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';

export const likeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;
  try {
    if (!userId) {
      res.status(401).json({
        code: 'Unauthorized',
        message: 'User is not authenticated',
      });
      return;
    }

    const blogIdValue = Array.isArray(blogId) ? blogId[0] : blogId;
    if (!blogIdValue || !Types.ObjectId.isValid(blogIdValue)) {
      res.status(400).json({
        code: 'InvalidBlogId',
        message: 'Invalid blog id',
      });
      return;
    }

    const blogObjectId = new Types.ObjectId(blogIdValue);
    const blog = await Blog.findById(blogObjectId).select('likesCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    const existingLike = await Like.findOne({
      blogId: blogObjectId,
      userId,
    }).exec();
    if (existingLike) {
      res.status(400).json({
        code: 'AlreadyLiked',
        message: 'You have already liked this blog',
      });
      return;
    }
    await Like.create({ blogId: blogObjectId, userId });
    blog.likesCount++;
    await blog.save();

    logger.info(`User ${userId} liked blog ${blogObjectId}`);

    res.status(200).json({
      code: 'BlogLiked',
      message: 'Blog liked successfully',
      likesCount: blog.likesCount,
    });
  } catch (err) {
    logger.error('Error liking blog', { error: err });
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred while liking the blog',
    });
  }
};
