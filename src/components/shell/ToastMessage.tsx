import { StyleSheet, View } from 'react-native';
import type { MessageComponentProps } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingSnackbar, type FloatingSnackbarState } from '@/components/ui';
import { type Tokens, useStyles } from '@/theme';

export type ToastMessageProps = MessageComponentProps;

const STATE_BY_TYPE: Record<string, FloatingSnackbarState> = {
  success: 'success',
  danger: 'error',
  warning: 'warning',
  info: 'info',
  default: 'info',
  none: 'info',
};

type ToastAction = { label: string; onPress: () => void };

function actionOf(message: unknown): ToastAction | undefined {
  const action = (message as { action?: ToastAction }).action;
  return action && typeof action.onPress === 'function' ? action : undefined;
}

/** lib/toast's renderer: Kagaz FloatingSnackbar, mounted as the FlashMessage host in providers/. */
export function ToastMessage({ message }: ToastMessageProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles, { top: insets.top });
  const text = message.description ? `${message.message}\n${message.description}` : message.message;
  return (
    <View style={styles.root}>
      <FloatingSnackbar
        state={STATE_BY_TYPE[message.type ?? 'info'] ?? 'info'}
        message={text}
        action={actionOf(message)}
      />
    </View>
  );
}

type StyleParams = { top: number };

const createStyles = (tokens: Tokens, { top }: StyleParams) =>
  StyleSheet.create({
    root: { paddingTop: top + tokens.spacing[8], paddingHorizontal: tokens.spacing[16] },
  });
