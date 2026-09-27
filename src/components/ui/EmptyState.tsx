import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'empty' branch of every data screen. */
export function EmptyState({
  title,
  message,
  icon = 'inbox-outline',
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.root, style]}>
      <Icon name={icon} size="lg" color="textSecondary" />
      <Typography variant="h3" align="center">
        {title}
      </Typography>
      {message ? (
        <Typography color="textSecondary" align="center">
          {message}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.xl,
    },
    action: { alignSelf: 'center', marginTop: theme.spacing.sm },
  });
