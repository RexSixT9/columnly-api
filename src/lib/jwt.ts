import jwt from 'jsonwebtoken';
import config from '@/config';

import { Types } from 'mongoose';

export const generateAccessToken = (userId: Types.ObjectId): string => {
  const secret = config.jwtAccessSecret;
  if (!secret) {
    throw new Error('JWT access secret is not defined');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: config.access_token_expiration,
    subject: 'accessApi',
  });
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  const secret = config.jwtRefreshSecret;
  if (!secret) {
    throw new Error('JWT refresh secret is not defined');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: config.refresh_token_expiration,
    subject: 'refreshApi',
  });
};
