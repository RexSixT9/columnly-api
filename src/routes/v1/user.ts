// src/routes/v1/user.ts

import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { getCurrentUser } from '@/controllers/v1/user/get_current_user';
import { updateCurrentUser } from '@/controllers/v1/user/update_current_user';
import { validationError } from '@/middlewares/validationError';
import  validationErrorHandler  from '@/middlewares/validationErrorHandler';
import { deleteCurrentUser } from '@/controllers/v1/user/delete_current _user';
import { getAllUsers } from '@/controllers/v1/user/get_all_users';
import { getUser } from '@/controllers/v1/user/get_user';
import { deleteUser } from '@/controllers/v1/user/delete_user';
import { body } from 'express-validator';
import User from '@/models/user';
import { userIdParamSchema } from '@/validators/user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Username must be less than 30 characters')
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });
      if (userExists) {
        throw new Error('This username is already in use');
      }
    }),
  body('email')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Email must be less than 100 characters')
    .isEmail()
    .withMessage('Invalid email address')
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error('This email is already in use');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('first_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('First name must be less than 20 characters'),
  body('last_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Last name must be less than 20 characters'),
  body(['website', 'facebook', 'instagram', 'x', 'youtube'])
    .optional()
    .isURL()
    .withMessage('Invalid website URL')
    .isLength({ max: 100 })
    .withMessage('URL must be less than 100 characters'),
  validationError,
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get('/', authenticate, authorize(['admin']), getAllUsers);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  validationErrorHandler(userIdParamSchema, 'params'),
  getUser,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  validationErrorHandler(userIdParamSchema, 'params'),
  deleteUser,
);

export default router;
