import { ActivityIndicator, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles, useTheme } from '@/theme';

import { Typography } from './Typography';

export type LoadingStateProps = {
  message?: string;
  accessibilityLabel?: string;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

/** The 'loading' branch of every data screen. */
export function LoadingState({ message, accessibilityLabel, style }: LoadingStateProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? message}
      accessibilityState={{ busy: true }}
      style={[styles.root, style]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Typography color="textSecondary" align="center">
          {message}
        </Typography>
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
  });
