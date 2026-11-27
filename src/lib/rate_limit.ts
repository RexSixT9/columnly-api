import { rateLimit } from 'express-rate-limit';

const tooManyRequests = {
  code: 'TooManyRequests',
  message: 'Too many requests, please try again later.',
};

// Backstop for every route: 60 requests per minute per IP.
const limiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests,
});

// Sensitive auth endpoints: slow down brute-force and credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests,
});

// Uploads are expensive (buffering plus a Cloudinary round trip).
const uploadLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyRequests,
});

export { authLimiter, uploadLimiter };
export default limiter;
