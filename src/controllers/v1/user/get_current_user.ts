import { logger } from '@/lib/winston';

import User from '@/models/user';

import type { Request, Response } from 'express';

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const user = await User.findById(userId).select('-__v').lean().exec();
    if (!user) {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', message: 'User not found' });
      return;
    }
    logger.info(`Current user fetched: ${user.username} (${user._id})`);
    res.status(200).json({
      code: 'SUCCESS',
      message: 'Current user fetched successfully',
      data: user,
    });
    return;
  } catch (error) {
    logger.error('Error fetching current user:', error);
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    });
    return;
  }
};
