import { adapter } from './adapter';
import type { AnalyticsProps } from './types';

export type { AnalyticsAdapter, AnalyticsProps } from './types';

export function initAnalytics() {
  return adapter.init();
}

export function trackEvent(name: string, props?: AnalyticsProps) {
  adapter.trackEvent(name, props);
}

export function identifyUser(userId: string, traits?: AnalyticsProps) {
  adapter.identify(userId, traits);
}

export function setUserProperties(props: AnalyticsProps) {
  adapter.setUserProperties(props);
}

export function resetAnalytics() {
  adapter.reset();
}
