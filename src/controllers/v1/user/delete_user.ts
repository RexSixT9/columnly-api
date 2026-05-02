import { Request, Response } from 'express';
import { logger } from '@/lib/winston';
import User from '@/models/user';
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

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
