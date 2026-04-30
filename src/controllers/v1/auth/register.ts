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
    
    if (!email || !password) {
      res.status(400).json({
        code: 'InvalidInput',
        message: 'Email and password are required',
      });
      return;
    }
    const emailNormalized = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailNormalized })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

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
      (!config.whiteListedAdmins ||
        !config.whiteListedAdmins.includes(emailNormalized))
    ) {
      res.status(403).json({
        code: 'Unauthorized',
        message: 'You are not authorized to register as an admin',
      });
      logger.warn(
        `Unauthorized admin registration attempt: ${emailNormalized}`,
      );
      return;
    }

    const newUser = new User({
      username,
      email: emailNormalized,
      password,
      role,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    const token = new Token({
      userId: newUser._id,
      token: refreshToken,
    });

    await token.save();
    logger.info(`Saving refresh token for user: ${emailNormalized}`);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
    });

    logger.info(`User registered: ${emailNormalized}`);
    res.status(201).json({
      code: 'UserRegistered',
      data: {
        username,
        email: emailNormalized,
        role,
      },
      accessToken,
      message: 'User registered successfully',
    });
  } catch (err) {
    logger.error('Error in register controller:', err);
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: err,
    });
  }
};
