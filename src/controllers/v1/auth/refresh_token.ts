import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

import Token from '@/models/tokens';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';

interface RefreshTokenPayload {
  userId: Types.ObjectId;
}

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;
  if (!refreshToken) {
    res.status(401).json({
      code: 'NoToken',
      message: 'Refresh token is required',
    });
    return;
  }
  try {
    const tokenExists = await Token.exists({ token: refreshToken });
    if (!tokenExists) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    const jwtPayload = verifyRefreshToken(
      refreshToken,
    ) as unknown as RefreshTokenPayload;

    const accessToken = generateAccessToken(jwtPayload.userId);
    logger.info('Refresh token processed successfully');

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token expired, please login again',
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: err,
    });

    logger.error('Error during refresh token', err);
  }
};

export default refreshToken;
