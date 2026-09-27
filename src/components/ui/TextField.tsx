import { type Ref, useState } from 'react';
import {
  type StyleProp,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { type Theme, useStyles, useTheme } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/utils/a11y';

import { Typography } from './Typography';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'editable'> & {
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  ref?: Ref<TextInput>;
  /** Layout-only escape hatch, merged last onto the container. */
  style?: StyleProp<ViewStyle>;
};

/** TextInput + label/error/helper. Keyboard avoidance comes from <Screen scroll> (keyboard-controller). */
export function TextField({
  label,
  helperText,
  error,
  disabled = false,
  ref,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...inputProps
}: TextFieldProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const hint = error ?? helperText;
  return (
    <View style={[styles.root, style]}>
      {label ? (
        <Typography variant="label" color="textSecondary">
          {label}
        </Typography>
      ) : null}
      <TextInput
        {...inputProps}
        ref={ref}
        editable={!disabled}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          Boolean(error) && styles.invalid,
          disabled && styles.disabled,
        ]}
      />
      {hint ? (
        <Typography variant="caption" color={error ? 'error' : 'textSecondary'}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { gap: theme.spacing.xs },
    input: {
      ...theme.typography.body,
      minHeight: MIN_TOUCH_TARGET,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
    },
    focused: { borderColor: theme.colors.primary },
    invalid: { borderColor: theme.colors.error },
    disabled: { color: theme.colors.textDisabled, backgroundColor: theme.colors.divider },
  });
