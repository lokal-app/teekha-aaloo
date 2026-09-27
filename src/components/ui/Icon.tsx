import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { type SemanticColors, type Theme, useTheme } from '@/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type IconSize = 'sm' | 'md' | 'lg';

export type IconProps = {
  name: IconName;
  size?: IconSize;
  color?: keyof SemanticColors;
  /** Set for meaningful icons; omitted = decorative (hidden from screen readers). */
  accessibilityLabel?: string;
  /** Layout-only escape hatch. */
  style?: StyleProp<ViewStyle>;
};

function sizeFor(theme: Theme, size: IconSize) {
  const sizes: Record<IconSize, number> = {
    sm: theme.spacing.lg,
    md: theme.spacing.xl,
    lg: theme.spacing.xxl,
  };
  return sizes[size];
}

/** Icon-set wrapper: token sizes, semantic colors. */
export function Icon({
  name,
  size = 'md',
  color = 'textPrimary',
  accessibilityLabel,
  style,
}: IconProps) {
  const theme = useTheme();
  const decorative = !accessibilityLabel;
  return (
    <MaterialCommunityIcons
      name={name}
      size={sizeFor(theme, size)}
      color={theme.colors[color]}
      style={style}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
    />
  );
}
