import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import User from '@/models/user';

import type { Request, Response } from 'express';

const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;

    const user = await User.findById(userId).select('role').exec();
    const blog = await Blog.findOne({ slug })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    // Draft blogs are only viewable by the author or admins.
    // if (blog.status === 'draft') {
    //   if (!userId) {
    //     res.status(401).json({
    //       code: 'AuthenticationError',
    //       message: 'Access token is required',
    //     });
    //     return;
    //   }

    //   const user = await User.findById(userId).select('role').exec();

    //   const isAuthor =
    //     blog.author &&
    //     String((blog.author as any)._id || blog.author) === String(userId);
    //   if (user?.role !== 'admin' && !isAuthor) {
    //     res.status(403).json({
    //       code: 'AuthorizationError',
    //       message: 'Access denied, insufficient permissions',
    //     });

    //     logger.warn('A non-author attempted to access a draft blog', {
    //       userId,
    //       blog: { slug: blog.slug, status: blog.status },
    //     });
    //     return;
    //   }
    // }

    if (user?.role === 'user' && blog.status === 'draft') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'Access denied, insufficient permissions',
      });

      logger.warn('A user tried to access a draft blog', {
        userId,
        blog,
      });
      return;
    }

    res.status(200).json({
      blog,
    });
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error while fetching blog by slug', err);
  }
};

export default getBlogBySlug;
