import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { MulterError } from 'multer';

import config from '@/config';
import limiter from '@/lib/rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

import v1Routes from '@/routes/v1';
import healthRoutes from '@/routes/health';

import type { CorsOptions } from 'cors';
import type { ErrorRequestHandler } from 'express';

const app = express();

app.set('trust proxy', config.trustProxy);

// Development may use any localhost port, but never arbitrary remote origins.
const isLocalDevOrigin = (value?: string): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
};

// CORS configuration
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!config.whiteListedOrigins) {
      return callback(new Error('whiteListedOrigins is not set in config'));
    }

    const isAllowed =
      !origin ||
      config.whiteListedOrigins.includes(origin) ||
      (config.nodeEnv === 'development' && isLocalDevOrigin(origin));

    if (isAllowed) {
      logger.info(`CORS allowed for origin: ${origin ?? 'no-origin'}`);
      callback(null, true);
    } else {
      logger.warn(`CORS blocked: ${origin}`);
      callback(new Error(`CORS Error: ${origin} not allowed`), false);
    }
  },
  credentials: true,
};

// Apply middleware in the correct order
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 2048, // Compress responses larger than 2KB
  }),
);
app.use(helmet()); // Set security-related HTTP headers
app.use(limiter); // Apply rate limiting to all requests

// Routes
app.use('/health', healthRoutes); // Liveness/readiness probe (unversioned)
app.use('/api/v1', v1Routes);

// 404 handler for unmatched routes
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralised error handler (e.g. CORS rejections, unexpected failures)
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : 'Internal server error';

  if (err instanceof MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    logger.warn(`Upload rejected: ${err.code}`);
    res.status(tooLarge ? 413 : 400).json({
      code: tooLarge ? 'PayloadTooLarge' : 'InvalidUpload',
      message: tooLarge
        ? 'Banner image must be less than 2MB'
        : 'Invalid upload',
    });
    return;
  }

  if (message.startsWith('CORS Error')) {
    logger.warn(message);
    res.status(403).json({ status: 'error', message });
    return;
  }

  logger.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};

app.use(errorHandler);

// Start the server
(async () => {
  try {
    await connectToDatabase();
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Error starting server:', err);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.info('Shutting down server gracefully...');
    process.exit(0);
  } catch (err) {
    logger.error('Error occurred while shutting down server:', err);
  }
};

process.on('SIGINT', handleServerShutdown); // Handle Ctrl+C signal for graceful shutdown
process.on('SIGTERM', handleServerShutdown); // Handle termination signal for graceful shutdown
