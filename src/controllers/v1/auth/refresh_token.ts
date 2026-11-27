import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/jwt';
import hashRefreshToken from '@/lib/token_hash';
import { clearRefreshCookie, setRefreshCookie } from '@/lib/cookies';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/winston';

import Token from '@/models/tokens';

import type { Request, Response } from 'express';
import { Types } from 'mongoose';

interface RefreshTokenPayload {
  userId: Types.ObjectId;
}

const refreshToken = async (req: Request, res: Response) => {
  const presentedToken = req.cookies?.refreshToken as string | undefined;
  if (!presentedToken) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Refresh token is required',
    });
    return;
  }

  try {
    const payload = verifyRefreshToken(
      presentedToken,
    ) as unknown as RefreshTokenPayload;
    const userId = payload.userId;

    // Consume the presented token atomically. A second presentation of the
    // same token means it was rotated already, which indicates theft.
    const storedToken = await Token.findOneAndDelete({
      token: hashRefreshToken(presentedToken),
    }).exec();

    if (!storedToken) {
      await Token.deleteMany({ userId });
      clearRefreshCookie(res);
      audit('token_reuse_detected', { userId: userId.toString() });
      res.status(401).json({
        code: 'TokenReuseDetected',
        message: 'Refresh token has already been used. Please log in again.',
      });
      return;
    }

    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    await Token.create({
      userId,
      token: hashRefreshToken(newRefreshToken),
    });
    setRefreshCookie(res, newRefreshToken);

    res.status(200).json({ accessToken });
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

    logger.error('Error during refresh token', err);
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
    });
  }
};

export default refreshToken;
