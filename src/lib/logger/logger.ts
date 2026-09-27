import { env } from '@env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = env.APP_ENV === 'production' ? 'warn' : 'debug';

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

// The single sanctioned console sink in src/ (eslint.config.mjs scopes no-console off here only).
export const logger = {
  debug(message: string, ...context: unknown[]) {
    if (shouldLog('debug')) console.debug(`[debug] ${message}`, ...context);
  },
  info(message: string, ...context: unknown[]) {
    if (shouldLog('info')) console.info(`[info] ${message}`, ...context);
  },
  warn(message: string, ...context: unknown[]) {
    if (shouldLog('warn')) console.warn(`[warn] ${message}`, ...context);
  },
  error(message: string, ...context: unknown[]) {
    if (shouldLog('error')) console.error(`[error] ${message}`, ...context);
  },
};
