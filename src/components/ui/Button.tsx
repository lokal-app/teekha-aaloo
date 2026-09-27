import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { type Theme, useStyles, useTheme } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/utils/a11y';

import { Icon, type IconName } from './Icon';
import { Typography, type TypographyColor } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Layout-only escape hatch (margins, flex, alignSelf, width). */
  style?: StyleProp<ViewStyle>;
};

const LABEL_COLOR: Record<ButtonVariant, TypographyColor> = {
  primary: 'onPrimary',
  secondary: 'onSecondary',
  ghost: 'primary',
  danger: 'onError',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const inactive = disabled || loading;
  const labelColor = inactive ? 'textDisabled' : LABEL_COLOR[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors[labelColor]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size="sm" color={labelColor} /> : null}
          <Typography variant="button" color={labelColor}>
            {label}
          </Typography>
        </>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: MIN_TOUCH_TARGET,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    sm: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs },
    md: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
    lg: { paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: theme.colors.error },
    inactive: { backgroundColor: theme.colors.divider },
    pressed: { opacity: 0.8 },
  });
