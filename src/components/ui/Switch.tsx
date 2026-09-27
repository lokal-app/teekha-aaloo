import { type StyleProp, StyleSheet, Switch as RNSwitch, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles, useTheme } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/utils/a11y';

import { Typography } from './Typography';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  accessibilityLabel,
  style,
}: SwitchProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <View style={[styles.root, style]}>
      {label ? (
        <Typography color={disabled ? 'textDisabled' : 'textPrimary'} style={styles.label}>
          {label}
        </Typography>
      ) : null}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ checked: value, disabled }}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.surfaceElevated}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      minHeight: MIN_TOUCH_TARGET,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    label: { flex: 1 },
  });
