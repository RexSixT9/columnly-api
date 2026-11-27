import dotenv from 'dotenv';
import { z } from 'zod';
import type ms from 'ms';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  LOG_LEVEL: z.string().default('info'),
  WHITE_LISTED_ORIGINS: z.string().optional(),
  TRUST_PROXY: z.string().optional(),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRATION: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRATION: z.string().default('7d'),
  WHITELIST_ADMINS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const env = parsedEnv.data;

const parseOrigins = (value?: string): string[] =>
  (
    value ??
    'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const parseWhitelist = (value?: string): string[] =>
  value
    ? value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    : [];

const parseTrustProxy = (value?: string): boolean | number => {
  if (!value) {
    // One trusted reverse proxy (Render/Nginx) by default in production.
    return env.NODE_ENV === 'production' ? 1 : false;
  }
  if (value === 'true') return true;
  if (value === 'false') return false;

  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error('TRUST_PROXY must be true, false, or a non-negative integer');
  }
  return hops;
};

const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  trustProxy: parseTrustProxy(env.TRUST_PROXY),
  logLevel: env.LOG_LEVEL,
  whiteListedOrigins: parseOrigins(env.WHITE_LISTED_ORIGINS),
  MONGO_URI: env.MONGO_URI,
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  access_token_expiration: env.ACCESS_TOKEN_EXPIRATION as ms.StringValue,
  refresh_token_expiration: env.REFRESH_TOKEN_EXPIRATION as ms.StringValue,
  whiteListedAdmins: parseWhitelist(env.WHITELIST_ADMINS),
  defaultResLimit: 20,
  defaultResOffset: 0,
  cloudinaryName: env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: env.CLOUDINARY_API_SECRET,
};

export default config;
