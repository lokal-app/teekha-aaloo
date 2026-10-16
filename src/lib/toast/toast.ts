import { hideMessage, showMessage } from 'react-native-flash-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  type?: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
  /** Optional text action on the snackbar (label already translated by the caller). */
  action?: { label: string; onPress: () => void };
};

const FLASH_TYPE = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
} as const;

/**
 * Imperative toast (§A7.1 #10). Call from screen data hooks only — never from JSX.
 * Renders nothing itself: the Kagaz FloatingSnackbar host (shell/ToastMessage) is mounted in providers/.
 */
export function showToast({
  type = 'info',
  title,
  description,
  durationMs = 3000,
  action,
}: ToastOptions) {
  // `action` rides on the message object to shell/ToastMessage, which renders it.
  showMessage({
    type: FLASH_TYPE[type],
    message: title,
    description,
    duration: durationMs,
    ...{ action },
  });
}

export function hideToast() {
  hideMessage();
}
