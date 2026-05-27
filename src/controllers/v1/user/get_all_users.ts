import { logger } from '@/lib/winston';
import User from '@/models/user';
import config from '@/config';

import type { Request, Response } from 'express';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    if (limit < 1 || limit > 50 || offset < 0) { //min 1 and max 50 for limit 
      return res.status(400).json({
        code: 'InvalidPaginationParameters',
        message: 'Limit must be between 1 and 50, and offset must be non-negative',
      });
    }
    const total = await User.countDocuments().exec();
    const users = await User.find()
      .select('-password -__v')
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    logger.info('Fetched all users successfully');

    res.json({
      code: 'GetAllUsersSuccess',
      message: 'All users fetched successfully',
      total,
      users,
    });
  } catch (err) {
    logger.error('Get all users error', {
      error: err instanceof Error ? err.message : err,
    });

    res.status(500).json({
      code: 'GetAllUsersError',
      message: 'An error occurred while fetching all users',
    });
  }
};
