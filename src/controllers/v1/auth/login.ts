import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import config from '@/config';
import { logger } from '@/lib/winston';

import User from '@/models/user';
import Token from '@/models/tokens';

import type { IUser } from '@/models/user';

import type { Request, Response } from 'express';

type userData = Pick<IUser, 'email' | 'password'>;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as userData;
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();
    if (!user) {
      res.status(401).json({
        code: 'user_not_found',
        message: 'Invalid email or password',
      });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await Token.create({ userId: user._id, token: refreshToken });
    logger.info(`User ${user.email} logged in successfully`);

    res.cookie('refeshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    logger.error(`Login error: ${err}`);
    res.status(500).json({});
  }
};
