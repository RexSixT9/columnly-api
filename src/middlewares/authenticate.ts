// current file: src/middlewares/authenticate.ts

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

type JwtPayload = {
  userId: Types.ObjectId;
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'NoToken',
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        code: 'NoToken',
        message: 'Access token is required',
      });
      return;
    }

    const jwtPayload = verifyAccessToken(token) as unknown as JwtPayload;

    req.userId = jwtPayload.userId;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logger.warn('Expired access token', { error: err.message });
      res.status(401).json({
        code: 'ExpiredToken',
        message: 'Access token has expired',
      });
      return;
    } else if (err instanceof JsonWebTokenError) {
      logger.warn('Invalid access token', { error: err.message });
      res.status(401).json({
        code: 'InvalidToken',
        message: 'Invalid access token',
      });
      return;
    } else {
      logger.error('Unexpected error in authentication middleware', {
        error: err,
      });
      res.status(500).json({
        code: 'InternalError',
        message: 'An unexpected error occurred',
      });
      return;
    }
  }
};
