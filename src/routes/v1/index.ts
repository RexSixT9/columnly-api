import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Example route
router.get('/', (req, res) => {
  res
    .status(200)
    .json({
      message: 'Welcome to the API!',
      status: 'OK',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
});

// Mount auth routes
router.use('/auth', authRoutes);

export default router;
