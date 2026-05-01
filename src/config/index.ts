import dotenv from 'dotenv';
import { logger } from '@/lib/winston';
import type ms from 'ms';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || 'info',
  whiteListedOrigins: [
    'localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  MONGO_URI: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  access_token_expiration: process.env
    .ACCESS_TOKEN_EXPIRATION as ms.StringValue,
  refresh_token_expiration: process.env
    .REFRESH_TOKEN_EXPIRATION as ms.StringValue,
  whiteListedAdmins: process.env.WHITELIST_ADMINS
    ? process.env.WHITELIST_ADMINS.split(',').map((email) =>
        email.trim().toLowerCase(),
      )
    : [],
  defaultResLimit: 20,
  defaultResOffset: 0,
};

export default config;
