import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import config from '@/config';

import { Types } from 'mongoose';

export const generateAccessToken = (userId: Types.ObjectId | string): string => {
  const secret = config.jwtAccessSecret;
  if (!secret) {
    throw new Error('JWT access secret is not defined');
  }
  return jwt.sign({ userId }, secret, {
    algorithm: 'HS256',
    expiresIn: config.access_token_expiration,
    subject: 'accessApi',
  });
};

export const generateRefreshToken = (userId: Types.ObjectId | string): string => {
  const secret = config.jwtRefreshSecret;
  if (!secret) {
    throw new Error('JWT refresh secret is not defined');
  }
  return jwt.sign({ userId }, secret, {
    algorithm: 'HS256',
    expiresIn: config.refresh_token_expiration,
    subject: 'refreshApi',
    jwtid: randomUUID(), // guarantees a distinct token on every rotation
  });
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const secret = config.jwtAccessSecret;
  if (!secret) {
    throw new Error('JWT access secret is not defined');
  }
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    subject: 'accessApi',
  }) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = config.jwtRefreshSecret;
  if (!secret) {
    throw new Error('JWT refresh secret is not defined');
  }
  return jwt.verify(token, secret, {
    algorithms: ['HS256'],
    subject: 'refreshApi',
  }) as { userId: string };
};
