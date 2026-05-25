import { v2 as cloudinary } from 'cloudinary';

import { logger } from '@/lib/winston';

import type { Request, Response } from 'express';
import Blog from '@/models/blog';
import User from '@/models/user';

const deleteBlog = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { blogId } = req.params;

    const user = await User.findById(userId).select('role').lean().exec();
    const deletedBlog = await Blog.findByIdAndDelete(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!deletedBlog) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Blog not found' });
      return;
    }

    if (deletedBlog.author !== userId && user?.role !== 'admin') {
      logger.warn(
        `User with ID ${userId} attempted to delete blog with ID ${blogId} without permission`,
      );
      res.status(403).json({ code: 'FORBIDDEN', message: 'Forbidden access' });
      return;
    }
    if (deletedBlog.banner?.publicId) {
      await cloudinary.uploader.destroy(deletedBlog.banner.publicId, {
        resource_type: 'image',
      });
    }

    await Blog.deleteOne({ _id: blogId }).exec();
    logger.info(
      `Blog with ID ${blogId} deleted successfully by user ID ${userId}`,
    );

    res.json({ code: 'Success', message: 'Blog deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting blog: ${error}`);
    res
      .status(500)
      .json({
        code: 'InternalServerError',
        message: 'An unexpected error occurred while deleting the blog',
      });
  }
};

export default deleteBlog;
