import { createHash } from 'node:crypto';

// Refresh tokens are stored as SHA-256 digests so a database read
// cannot be replayed directly against /auth/refresh-token.
const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export default hashRefreshToken;
