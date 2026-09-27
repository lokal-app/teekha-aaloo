import { adapter } from './adapter';
import type { CrashContext } from './types';

export type { CrashAdapter, CrashContext } from './types';

export function initCrash() {
  return adapter.init();
}

export function recordError(error: unknown, context?: CrashContext) {
  adapter.recordError(error, context);
}

export function crashLog(message: string) {
  adapter.log(message);
}

export function setCrashUser(userId: string | null) {
  adapter.setUser(userId);
}
