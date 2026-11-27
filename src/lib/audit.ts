import { logger } from '@/lib/winston';

// Security-relevant events. Never pass credentials or raw tokens here.
export const audit = (
  event: string,
  details: Record<string, unknown> = {},
  level: 'info' | 'warn' = 'warn',
): void => {
  logger[level](`AUDIT ${event}`, details);
};
