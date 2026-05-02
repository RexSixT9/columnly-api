// current file: src/controllers/v1/auth/refresh_token.ts

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/jwt';
import { logger } from '@/lib/winston';

import Token from '@/models/tokens';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';

interface RefreshTokenPayload {
  userId: Types.ObjectId;
}

const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken as string;
  if (!token) {
    res.status(401).json({
      code: 'NoToken',
      message: 'Refresh token is required',
    });
    return;
  }
  try {
    const jwtPayload = verifyRefreshToken(
      token,
    ) as unknown as RefreshTokenPayload;

    const tokenDoc = await Token.findOneAndDelete({ token }).exec();
    if (!tokenDoc) {
      logger.warn('Refresh token not found in database', { token });
      res.status(401).json({
        code: 'InvalidToken',
        message: 'Invalid refresh token',
      });
      return;
    }

    const newRefreshToken = generateRefreshToken(jwtPayload.userId);
    await Token.create({ token: newRefreshToken, userId: jwtPayload.userId });

    // const tokenExists = await Token.exists({ token });
    // if (!tokenExists) {
    //   res.status(401).json({
    //     code: 'InvalidToken',
    //     message: 'Invalid refresh token',
    //   });
    //   return;
    // }

    const accessToken = generateAccessToken(jwtPayload.userId);
    logger.info('Refresh token processed successfully');

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

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
