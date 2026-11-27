import { Router } from 'express';
import { register } from '@/controllers/v1/auth/register';
import { login } from '@/controllers/v1/auth/login';
import { loginSchema, registerSchema } from '@/validators/auth';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import { logout } from '@/controllers/v1/auth/logout';
import { logoutAll } from '@/controllers/v1/auth/logout_all';
import { authenticate } from '@/middlewares/authenticate';
import { authLimiter } from '@/lib/rate_limit';

import validationErrorHandler from '@/middlewares/validationErrorHandler';

const router = Router();

// Auth responses contain tokens and account data; never cache them.
router.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

router.post(
  '/register',
  authLimiter,
  validationErrorHandler(registerSchema),
  register,
);

router.post('/login', authLimiter, validationErrorHandler(loginSchema), login);

router.post('/refresh-token', authLimiter, refreshToken);

router.post('/logout', authenticate, logout);

router.post('/logout-all', authenticate, authLimiter, logoutAll);

export default router;
