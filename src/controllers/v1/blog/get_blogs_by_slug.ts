import { logger } from '@/lib/winston';
import type { Request, Response } from 'express';

import Blog from '@/models/blog';
import User from '@/models/user';

const getBlogsBySlug = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    if (!slug) {
      res.status(400).json({ code: 'InvalidSlug', message: 'Invalid slug provided' });
      return;
    }

    const user = await User.findById(userId).select('role').exec();

    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Blog not found',
      });
      return;
    }

    if (user?.role === 'user' && blog.status === 'draft') {
      logger.warn(
        `User with ID ${userId} attempted to access draft blog with slug ${slug}`,
      );
      res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Forbidden access to draft blog',
      });
      return;
    }

    logger.info(
      `Blogs with slug ${slug} fetched successfully by user ID ${userId}`,
    );
    res.status(200).json({ blog });
  } catch (error) {
    logger.error('Error fetching blogs by slug', { error });
    res.status(500).json({ code: 'InternalServerError', message: 'An unexpected error occurred while fetching the blog' });
  }
};

export default getBlogsBySlug;
