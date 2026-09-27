import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles } from '@/theme';

import { Button } from './Button';
import { Icon } from './Icon';
import { Typography } from './Typography';

export type ErrorStateProps = {
  title: string;
  message?: string;
  retryLabel: string;
  onRetry: () => void;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'error' branch of every data screen: message + retry(). */
export function ErrorState({ title, message, retryLabel, onRetry, style }: ErrorStateProps) {
  const styles = useStyles(createStyles);
  return (
    <View accessibilityRole="alert" style={[styles.root, style]}>
      <Icon name="alert-circle-outline" size="lg" color="error" />
      <Typography variant="h3" align="center">
        {title}
      </Typography>
      {message ? (
        <Typography color="textSecondary" align="center">
          {message}
        </Typography>
      ) : null}
      <Button label={retryLabel} onPress={onRetry} variant="secondary" style={styles.action} />
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
