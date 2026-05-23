import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';


export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token is required',
      });
      return;
    }

    const [_, token] = authHeader.split(' ');

    if (!token) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token is required',
      });
      return;
    }

    const jwtPayload = verifyAccessToken(token) as unknown as {
      userId: Types.ObjectId;
    };

    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logger.warn('Expired access token', { error: err.message });
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token has expired',
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      logger.warn('Invalid access token', { error: err.message });
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid access token',
      });
      return;
    }

    logger.error('Unexpected error in authentication middleware', {
      error: err,
    });
    res.status(500).json({
      code: 'InternalError',
      message: 'An unexpected error occurred',
    });
    return;
  }
};
