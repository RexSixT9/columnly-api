import { logger } from '@/lib/winston';
import { Request, Response } from 'express';
import User from '@/models/user';

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('-password -__v').exec();

    if (!user) {
      return res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
    }

    logger.info(`User ${userId} fetched successfully`);

    res.status(200).json({
      code: 'Success',
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error(`Error in getUser: ${error}`);
    res.status(500).json({
      code: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  }
};
