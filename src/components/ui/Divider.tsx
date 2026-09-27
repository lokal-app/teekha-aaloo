import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles } from '@/theme';

export type DividerProps = {
  variant?: 'full' | 'inset';
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

export function Divider({ variant = 'full', style }: DividerProps) {
  const styles = useStyles(createStyles);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.root, variant === 'inset' && styles.inset, style]}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
      alignSelf: 'stretch',
    },
    inset: { marginHorizontal: theme.spacing.lg },
  });
