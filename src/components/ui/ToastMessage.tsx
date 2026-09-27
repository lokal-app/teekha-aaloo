import { StyleSheet, View } from 'react-native';
import type { MessageComponentProps } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type SemanticColors, type Theme, useStyles } from '@/theme';

import { Typography } from './Typography';

export type ToastMessageProps = MessageComponentProps;

type Accent = keyof Pick<SemanticColors, 'success' | 'error' | 'warning' | 'info'>;

const ACCENT_BY_TYPE: Record<string, Accent> = {
  success: 'success',
  danger: 'error',
  warning: 'warning',
  info: 'info',
  default: 'info',
  none: 'info',
};

/** Token-styled renderer for lib/toast; mounted as the FlashMessage host in providers/index.tsx. */
export function ToastMessage({ message }: ToastMessageProps) {
  const insets = useSafeAreaInsets();
  const styles = useStyles(createStyles, { top: insets.top });
  const accent = ACCENT_BY_TYPE[message.type ?? 'info'] ?? 'info';
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.root}>
      <View style={[styles.card, styles[accent]]}>
        <Typography variant="label">{message.message}</Typography>
        {message.description ? (
          <Typography variant="bodySm" color="textSecondary">
            {message.description}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}

type StyleParams = { top: number };

const createStyles = (theme: Theme, { top }: StyleParams) =>
  StyleSheet.create({
    root: { paddingTop: top + theme.spacing.sm, paddingHorizontal: theme.spacing.lg },
    card: {
      ...theme.shadows.md,
      gap: theme.spacing.xxs,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderLeftWidth: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceElevated,
    },
    success: { borderLeftColor: theme.colors.success },
    error: { borderLeftColor: theme.colors.error },
    warning: { borderLeftColor: theme.colors.warning },
    info: { borderLeftColor: theme.colors.info },
  });
