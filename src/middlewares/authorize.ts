import { logger } from '@/lib/winston';
import { Request, Response, NextFunction } from 'express';

import User from '@/models/user';

export type AuthRole = 'admin' | 'user';

export const authorize = (roles: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
        return;
      }
      const user = await User.findById(userId).select('role').exec();
      if (!user || !roles.includes(user.role)) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Forbidden' });
        return;
      }
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
      return;
    }
  };
};
