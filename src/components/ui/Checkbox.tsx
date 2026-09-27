import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { type Theme, useStyles } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/utils/a11y';

import { Icon } from './Icon';
import { Typography } from './Typography';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  accessibilityLabel,
  style,
}: CheckboxProps) {
  const styles = useStyles(createStyles);
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked, disabled }}
      style={[styles.root, style]}
    >
      <View style={[styles.box, checked && styles.checked, disabled && styles.disabled]}>
        {checked ? <Icon name="check" size="sm" color="onPrimary" /> : null}
      </View>
      {label ? (
        <Typography color={disabled ? 'textDisabled' : 'textPrimary'}>{label}</Typography>
      ) : null}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      minHeight: MIN_TOUCH_TARGET,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    box: {
      width: theme.spacing.xl,
      height: theme.spacing.xl,
      borderRadius: theme.radius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    disabled: { backgroundColor: theme.colors.divider, borderColor: theme.colors.divider },
  });
