import { Request, Response } from 'express';
import { logger } from '@/lib/winston';
import User from '@/models/user';

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .select('+password -__v')
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'UserNotFoundError',
        message: 'User not found',
      });
      return;
    }

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      website,
      facebook,
      x,
      instagram,
      youtube,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (username && username === user.username) {
      res.status(400).json({
        code: 'UsernameUnchanged',
        message: 'Username is already your current username',
      });
      return;
    }

    if (normalizedEmail && normalizedEmail === user.email) {
      res.status(400).json({
        code: 'EmailUnchanged',
        message: 'Email is already your current email',
      });
      return;
    }

    if (username) {
      const usernameExists = await User.exists({
        username,
        _id: { $ne: user._id },
      });
      if (usernameExists) {
        res.status(409).json({
          code: 'UsernameAlreadyInUse',
          message: 'This username is already in use',
        });
        return;
      }
    }

    if (normalizedEmail) {
      const emailExists = await User.exists({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (emailExists) {
        res.status(409).json({
          code: 'EmailAlreadyInUse',
          message: 'This email is already in use',
        });
        return;
      }
    }

    if (normalizedEmail) user.email = normalizedEmail;
    if (username) user.username = username;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (!user.socialLinks) user.socialLinks = {};

    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (x) user.socialLinks.x = x;
    if (instagram) user.socialLinks.instagram = instagram;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();

    logger.info('Current user updated successfully', { userId });

    res.json({
      code: 'UpdateCurrentUserSuccess',
      message: 'Current user updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    logger.error('Update current user error', {
      error: err instanceof Error ? err.message : err,
    });

    res.status(500).json({
      code: 'UpdateCurrentUserError',
      message: 'An error occurred while updating the current user',
    });
  }
};
