import { logger } from '@/lib/winston';
import { audit } from '@/lib/audit';
import { setRefreshCookie } from '@/lib/cookies';
import config from '@/config';
import { genUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import hashRefreshToken from '@/lib/token_hash';

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

    // The assigned role is derived from the allow-list; the request body is
    // only used to detect a privileged-registration attempt.
    const isWhitelisted = config.whiteListedAdmins.includes(emailNormalized);
    const requestedAdmin = role === 'admin';

    if (requestedAdmin && config.nodeEnv !== 'production') {
      logger.info('Admin registration check', {
        email: emailNormalized,
        isWhitelisted,
        whitelistCount: config.whiteListedAdmins.length,
      });
    }

    if (requestedAdmin && !isWhitelisted) {
      audit('admin_registration_denied', { email: emailNormalized });
      res.status(403).json({
        code: 'Unauthorized',
        message: 'You are not authorized to register as an admin',
      });
      return;
    }

    const assignedRole = isWhitelisted ? 'admin' : 'user';

    const newUser = new User({
      username,
      email: emailNormalized,
      password,
      role: assignedRole,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    const token = new Token({
      userId: newUser._id,
      token: hashRefreshToken(refreshToken),
    });

    await token.save();
    setRefreshCookie(res, refreshToken);

    audit(
      'register',
      {
        userId: newUser._id.toString(),
        email: emailNormalized,
        role: assignedRole,
      },
      'info',
    );

    res.status(201).json({
      code: 'UserRegistered',
      data: {
        username,
        email: emailNormalized,
        role: assignedRole,
      },
      accessToken,
      message: 'User registered successfully',
    });
  } catch (err) {
    logger.error('Error in register controller:', err);
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
    });
  }
};
