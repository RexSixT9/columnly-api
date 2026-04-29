import { logger } from '@/lib/winston';
import config from '@/config';
import { genUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

import User from '@/models/user';
import Token from '@/models/tokens';

import type { IUser } from '@/models/user';
import type { Request, Response } from 'express';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as UserData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        code: 'UserAlreadyExists',
        message: 'User with this email already exists',
      });
      return;
    }

    const username = genUsername();

    if (
      role === 'admin' &&
      !config.whiteListedAdmins.includes(email.toLowerCase())
    ) {
      res.status(403).json({
        code: 'Unauthorized',
        message: 'You are not authorized to register as an admin',
      });
      logger.warn(`Unauthorized admin registration attempt: ${email}`);
      return;
    }

    const newUser = new User({
      username,
      email,
      password,
      role,
    });

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    const token = new Token({
      userId: newUser._id,
      token: refreshToken,
    });
    logger.info(`Saving refresh token for user: ${email}`);

    await token.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });

    await newUser.save();

    res.status(201).json({
      code: 'UserRegistered',
      data: {
        username,
        email,
        role,
      },
      accessToken,
      message: 'User registered successfully',
    });

    logger.info(`User registered: ${email}`);
  } catch (err) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: err,
    });
    logger.error('Error in register controller:', err);
  }
};
