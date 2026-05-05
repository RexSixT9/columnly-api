import { v2 as cloudinary } from 'cloudinary';

import { logger } from '@/lib/winston';
import User from '@/models/user';
import Blog from '@/models/blog';

import type { Request, Response } from 'express';

export const deleteCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).exec();

    if (!user) {
      res.status(404).json({
        code: 'UserNotFoundError',
        message: 'User not found',
      });
      return;
    }
    const userBlogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();
    for (const blog of userBlogs) {
      if (blog.banner?.publicId) {
        await cloudinary.uploader.destroy(blog.banner.publicId, {
          resource_type: 'image',
        });
      }
    }

    await Blog.deleteMany({ author: userId });

    await user.deleteOne({ _id: userId });

    logger.info('Current user deleted successfully', { userId });

    res.json({
      code: 'DeleteCurrentUserSuccess',
      message: 'Current user deleted successfully',
    });
  } catch (err) {
    logger.error('Delete current user error', {
      error: err instanceof Error ? err.message : err,
    });

    res.status(500).json({
      code: 'DeleteCurrentUserError',
      message: 'An error occurred while deleting the current user',
    });
  }
};
