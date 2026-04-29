import mongoose from 'mongoose';

import config from '@/config';
import { logger } from '@/lib/winston';

import type { ConnectOptions } from 'mongoose';

const clientOptions: ConnectOptions = {
  dbName: 'blog-db',
  appName: 'Blog API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  try {
    if (!config.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }
    await mongoose.connect(config.MONGO_URI, clientOptions);

    logger.info('Connected to MongoDB successfully');
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unknown error connecting to MongoDB');
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB successfully');
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error disconnecting from MongoDB: ${err.message}`);
    }
    logger.error('Error disconnecting from MongoDB:', err);
  }
};
