import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import hashRefreshToken from '@/lib/token_hash';
import { setRefreshCookie } from '@/lib/cookies';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/winston';
import bcrypt from 'bcrypt';

import User from '@/models/user';
import Token from '@/models/tokens';

import type { IUser } from '@/models/user';

import type { Request, Response } from 'express';

type userData = Pick<IUser, 'email' | 'password'>;

// bcrypt cost-12 hash used so unknown emails cost the same as real accounts.
const DUMMY_PASSWORD_HASH =
  '$2b$12$4LM.pZKQbHTrfhJq68X.guDv7CIMqgFzNaEMPK7X65KwbrzzjmUPC';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as userData;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email })
      .collation({ locale: 'en', strength: 2 })
      .select('+password email username role')
      .lean()
      .exec();

    const passwordMatches = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      audit('login_failed', {
        email: normalizedEmail,
        reason: user ? 'bad_password' : 'unknown_email',
      });
      res.status(401).json({
        code: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({
      userId: user._id,
      token: hashRefreshToken(refreshToken),
    });

    setRefreshCookie(res, refreshToken);
    logger.info(`Refresh token set for user: ${user.email}`);

    res.json({
      code: 'LoginSuccess',
      data: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
      accessToken,
    });

    audit('login_success', { userId: user._id.toString() }, 'info');
    logger.info(`Login successful for user: ${user.email}`);
  } catch (err) {
    logger.error('Login error', {
      error: err instanceof Error ? err.message : err,
    });
    res.status(500).json({
      code: 'ServerError',
      message: 'An error occurred while processing your request',
    });
  }
};
