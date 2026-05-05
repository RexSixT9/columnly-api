import config from '@/config';
import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import User from '@/models/user';

import type { Request, Response } from 'express';
interface QueryType {
  status?: 'draft' | 'published';
}

const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const parsedLimit = parseInt(req.query.limit as string, 10);
    const parsedOffset = parseInt(req.query.offset as string, 10);

    const limit = !Number.isNaN(parsedLimit)
      ? parsedLimit
      : config.defaultResLimit;
    const offset = !Number.isNaN(parsedOffset)
      ? parsedOffset
      : config.defaultResOffset;

    const query: QueryType = {};
    const user = await User.findById(userId).select('role').lean().exec();

    if (limit < 1 || limit > 50 || offset < 0) {
      res.status(400).json({
        code: 'InvalidPaginationParameters',
        message:
          'Limit must be between 1 and 50, and offset must be non-negative',
      });
      return;
    }

    // Show only the published post to a normal user.
    if (!user ||user.role === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ publishedAt: 'desc' })
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
    });
  } catch (err) {
    logger.error('Error while fetching blogs', err);
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
  }
};

export default getAllBlogs;
