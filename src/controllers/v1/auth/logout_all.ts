import { logger } from '@/lib/winston';
import { audit } from '@/lib/audit';
import { clearRefreshCookie } from '@/lib/cookies';
import Token from '@/models/tokens';

import type { Request, Response } from 'express';

// Revokes every refresh token belonging to the signed-in user.
const logoutAll = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    await Token.deleteMany({ userId });
    clearRefreshCookie(res);
    res.sendStatus(204);

    audit('logout_all', { userId: String(userId) }, 'info');
    logger.info('All user sessions revoked', { userId });
  } catch (err) {
    logger.error('Error during logout-all', err);

    res.status(500).json({
      code: 'ServerError',
      message: 'An error occurred while logging out. Please try again later.',
    });
  }
};

export { logoutAll };
