// src/routes/v1/user.ts

import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import { getCurrentUser } from '@/controllers/v1/user/get_current_user';
import { updateCurrentUser } from '@/controllers/v1/user/update_current_user';
import { updateCurrentUserSchema } from '@/validators/user';
import validationErrorHandler from '@/middlewares/validationError';
import { deleteCurrentUser } from '@/controllers/v1/user/delete_current _user';
import { getAllUsers } from '@/controllers/v1/user/get_all_users';

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
  validationErrorHandler((req) => updateCurrentUserSchema(req.userId)),
  updateCurrentUser,
);

router.delete(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  deleteCurrentUser,
);

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  getAllUsers,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin'])
  
)

export default router;
