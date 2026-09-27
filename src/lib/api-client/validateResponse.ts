import { env } from '@env';
import type { z } from 'zod';

/**
 * Non-production runtime parse (§A6.2 #4): throws loudly in development AND staging, typed
 * passthrough in production. The gate is APP_ENV — never __DEV__ (staging is a release build).
 */
export function validateResponse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  if (env.APP_ENV !== 'production') return schema.parse(data);
  return data as z.output<T>;
}
