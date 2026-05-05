import { v2 as cloudinary } from 'cloudinary';

import { logger } from '@/lib/winston';
import User from '@/models/user';
import Blog from '@/models/blog';

import type { Request, Response } from 'express';

export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    if (blogs.length) {
      const publicIds = blogs.map(({ banner }) => banner.publicId);
      await cloudinary.api.delete_resources(publicIds);
      logger.info('Multiple blog banners deleted from cloudinary', {
        publicIds,
      });

      await Blog.deleteMany({ author: userId });
      logger.info('Multiple blogs deleted', {
        userId,
        blogs,
      });
    }

    await User.deleteOne({ _id: userId });
    logger.info('A user account deleted', {
      userId,
    });

    res.status(200).json({
      code: 'Success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteUser: ${error}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  }
};
