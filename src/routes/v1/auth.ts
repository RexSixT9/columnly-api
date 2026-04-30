import { Router } from 'express';
import { register } from '@/controllers/v1/auth/register';
import { login } from '@/controllers/v1/auth/login';
import { loginSchema, registerSchema } from '@/validators/auth';
import refreshToken from '@/controllers/v1/auth/refresh_token';
import { logout } from '@/controllers/v1/auth/logout';
import { authenticate } from '@/middlewares/authenticate';

import validationErrorHandler from '@/middlewares/validationError';

const router = Router();

router.post('/register', validationErrorHandler(registerSchema), register);

router.post('/login', validationErrorHandler(loginSchema), login);

router.post('/refresh-token', refreshToken);

router.post('/logout', authenticate, logout);

export default router;
