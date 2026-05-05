import { logger } from '@/lib/winston';
import config from '@/config';
import { Request, Response } from 'express';

import Blog from '@/models/blog';
import User from '@/models/user';

interface QueryType {
  status?: 'draft' | 'published';
}

const getBlogsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId;

    const limit =
      parseInt(req.query.limit as string, 10) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string, 10) || config.defaultResOffset;

    const query: QueryType = {};
    const userId = req.params.userId;
    const currentUser = await User.findById(currentUserId)
      .select('role')
      .exec();

    if (!currentUser) {
      res.status(404).json({ code: 'UserNotFound', message: 'Current user not found' });
      return;
    }
    if (limit < 1 || limit > 50 || offset < 0) {
      res.status(400).json({
        code: 'InvalidPaginationParameters',
        message:
          'Limit must be between 1 and 50, and offset must be non-negative',
      });
      return;
    }
    if (currentUser?.role === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments({ author: userId, ...query });

    const blogs = await Blog.find({ author: userId, ...query })
      .select('-banner.publicId -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({ limit, offset, total, blogs });
  } catch (error) {
    logger.error('Error fetching blogs by user ID', { error });
    res
      .status(500)
      .json({ code: 'InternalServerError', message: 'Internal server error' });
  }
};

export default getBlogsByUserId;
