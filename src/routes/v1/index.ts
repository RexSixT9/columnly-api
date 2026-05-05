import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import blogRoutes from './blog';
import likeRoutes from './like';

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
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/likes', likeRoutes);

export default router;
