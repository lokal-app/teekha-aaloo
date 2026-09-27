import { adapter } from './adapter';
import type { PushNotification } from './types';

export type { PushAdapter, PushNotification, Unsubscribe } from './types';

export function registerNotificationHandlers() {
  adapter.registerNotificationHandlers();
}

export function initPush() {
  return adapter.init();
}

export function getPushToken() {
  return adapter.getToken();
}

export function onNotificationOpened(listener: (notification: PushNotification) => void) {
  return adapter.onNotificationOpened(listener);
}
