import { logger } from '@/lib/winston';
import { audit } from '@/lib/audit';
import { clearRefreshCookie } from '@/lib/cookies';
import hashRefreshToken from '@/lib/token_hash';
import Token from '@/models/tokens';

import type { Request, Response } from 'express';

const logout = async (req: Request, res: Response) => {
  try {
    const presentedToken = req.cookies?.refreshToken as string | undefined;

    if (presentedToken) {
      await Token.deleteOne({ token: hashRefreshToken(presentedToken) });
    }

    clearRefreshCookie(res);
    res.sendStatus(204);

    audit('logout', { userId: String(req.userId) }, 'info');
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
