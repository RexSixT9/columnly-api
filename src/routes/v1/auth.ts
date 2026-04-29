import { Router } from 'express';
import { register } from '@/controllers/v1/auth/register';
import { login } from '@/controllers/v1/auth/login';
import { loginSchema, registerSchema } from '@/validators/auth';

import validationErrorHandler from '@/middlewares/validationError';

const router = Router();

router.post('/register', validationErrorHandler(registerSchema), register);

router.post('/login', validationErrorHandler(loginSchema), login);

export default router;
