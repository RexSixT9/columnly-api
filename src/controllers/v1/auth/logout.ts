//current file: src/controllers/v1/auth/logout.ts

import { logger } from '@/lib/winston';
import config from '@/config';
import Token from '@/models/tokens';


import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken as string;

    if (!token) {
      res.status(400).json({
        code: 'NoToken',
        message: 'Refresh token is required for logout',
      });
      return;
    }

    await Token.deleteOne({ token });

    logger.info('Refresh token invalidated during logout');

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });

    res.sendStatus(204);

    logger.info('Logout successful');
  } catch (err) {
    logger.error('Logout error', {
      error: err instanceof Error ? err.message : err,
    });
    res.status(500).json({
      code: 'ServerError',
      message: 'An error occurred while processing your request',
    });
  }
};

export { logout };
