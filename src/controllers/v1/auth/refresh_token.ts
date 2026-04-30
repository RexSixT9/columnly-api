// current file: src/controllers/v1/auth/refresh_token.ts

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

import Token from '@/models/tokens';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';

interface RefreshTokenPayload {
  userId: Types.ObjectId;
}

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string;

  try {
    if (!token) {
      res.status(401).json({
        code: 'NoToken',
        message: 'Refresh token is required',
      });
      return;
    }
    const jwtPayload = verifyRefreshToken(
      token,
    ) as unknown as RefreshTokenPayload;

    const tokenExists = await Token.exists({ token });
    if (!tokenExists) {
      res.status(401).json({
        code: 'InvalidToken',
        message: 'Invalid refresh token',
      });
      return;
    }

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.json({
      code: 'TokenRefreshed',
      accessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logger.warn('Expired refresh token', { error: err.message });
      res.status(401).json({
        code: 'TokenExpired',
        message: 'Refresh token has expired',
      });
    } else if (err instanceof JsonWebTokenError) {
      logger.warn('Invalid refresh token', { error: err.message });
      res.status(401).json({
        code: 'InvalidToken',
        message: 'Invalid refresh token',
      });
    } else {
      logger.error('Refresh token error', {
        error: err instanceof Error ? err.message : err,
      });
      res.status(500).json({
        code: 'ServerError',
        message: 'An error occurred while processing your request',
      });
    }
  }
};

export default refreshToken;
