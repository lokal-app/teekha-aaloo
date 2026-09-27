import { adapter } from './adapter';

export type { ObservabilityAdapter, Trace } from './types';

export function initObservability() {
  return adapter.init();
}

export function startTrace(name: string) {
  return adapter.startTrace(name);
}
