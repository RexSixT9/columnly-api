import { Request, Response } from 'express';
import { logger } from '@/lib/winston';
import User from '@/models/user';

export const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    const {
      email,
      username,
      password,
      first_name,
      last_name,
      website,
      facebook,
      x,
      instagram,
      youtube,
    } = req.body;

    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'UserNotFoundError',
        message: 'User not found',
      });
      return;
    }

    // if (username && username === user.username) {
    //   res.status(400).json({
    //     code: 'UsernameUnchanged',
    //     message: 'Username is already your current username',
    //   });
    //   return;
    // }

    const normalizedEmail = email?.trim().toLowerCase();

    // if (normalizedEmail && normalizedEmail === user.email) {
    //   res.status(400).json({
    //     code: 'EmailUnchanged',
    //     message: 'Email is already your current email',
    //   });
    //   return;
    // }

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

    if (username) user.username = username;
    if (normalizedEmail) user.email = normalizedEmail;
    if (password) user.password = password;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (!user.socialLinks) user.socialLinks = {};

    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (x) user.socialLinks.x = x;
    if (instagram) user.socialLinks.instagram = instagram;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();

    logger.info('Current user updated successfully', { userId });

    res.status(200).json({
      code: 'UpdateCurrentUserSuccess',
      message: 'Current user updated successfully',
      user,
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
