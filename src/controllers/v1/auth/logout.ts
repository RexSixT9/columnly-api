import { logger } from '@/lib/winston';
import config from '@/config';
import Token from '@/models/tokens';

import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken as string;

    if (refreshToken) {
      await Token.deleteOne({ token: refreshToken });

      logger.info('User refresh token deleted successfully', {
        userId: req.userId,
        refreshToken,
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });

    res.sendStatus(204);

    logger.info('User logged out successfully', {
      userId: req.userId,
    });
  } catch (err) {
    logger.error('Error during logout', err);
    
    res.status(500).json({
      code: 'ServerError',
      message: 'An error occurred while logging out. Please try again later.',
    });
  }
};

export { logout };
