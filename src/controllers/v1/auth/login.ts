import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config';
import { logger } from '@/lib/winston';
import bcrypt from 'bcrypt';

import User from '@/models/user';
import Token from '@/models/tokens';

import type { IUser } from '@/models/user';

import type { Request, Response } from 'express';

type userData = Pick<IUser, 'email' | 'password'>;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as userData;

    const user = await User.findOne({ email })
      .collation({ locale: 'en', strength: 2 })
      .select('+password email username role')
      .lean()
      .exec();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({
        code: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({ userId: user._id, token: refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });
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

    logger.info(`Login successful for user: ${user.email}`);
  } catch (err) {
    logger.error('Login error', {
      error: err instanceof Error ? err.message : err,
    });
    res.status(500).json({
      code: 'ServerError',
      message: 'An error occurred while processing your request',
      error: err,
    });
  }
};
