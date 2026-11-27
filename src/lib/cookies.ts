import config from '@/config';

import type { Response } from 'express';

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, refreshCookieOptions);
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', refreshCookieOptions);
};
