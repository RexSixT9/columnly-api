// Import dependencies
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

// Import configuration
import config from '@/config';
import limiter from '@/lib/rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';

// Import routes
import v1Routes from '@/routes/v1';

// Import types
import type { CorsOptions } from 'cors';

// Create Express app
const app = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!config.whiteListedOrigins) {
      return callback(new Error('whiteListedOrigins is not set in config'));
    }

    const isAllowed =
      config.nodeEnv === 'development' ||
      !origin || // server-to-server / non-browser requests
      config.whiteListedOrigins.includes(origin);

    if (isAllowed) {
      logger.info(`CORS allowed for origin: ${origin ?? 'no-origin'}`);
      callback(null, true);
    } else {
      logger.warn(`CORS blocked: ${origin}`);
      callback(new Error(`CORS Error: ${origin} not allowed`), false);
    }
  },
};

// Apply middleware in the correct order
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 2048, // Compress responses larger than 2KB
  }),
);
app.use(helmet()); // Set security-related HTTP headers
app.use(limiter); // Apply rate limiting to all requests

// Start the server
(async () => {
  try {
    await connectToDatabase();
    app.use('/api/v1', v1Routes);
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

process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);
