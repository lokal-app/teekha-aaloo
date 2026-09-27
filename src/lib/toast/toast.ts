import { hideMessage, showMessage } from 'react-native-flash-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  type?: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
};

const FLASH_TYPE = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
} as const;

/**
 * Imperative toast (§A7.1 #10). Call from screen data hooks only — never from JSX.
 * Renders nothing itself: the token-styled host (ui/ToastMessage) is mounted in providers/.
 */
export function showToast({ type = 'info', title, description, durationMs = 3000 }: ToastOptions) {
  showMessage({ type: FLASH_TYPE[type], message: title, description, duration: durationMs });
}

export function hideToast() {
  hideMessage();
}
