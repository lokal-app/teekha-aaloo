import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, Text, type TextProps, type ViewStyle } from 'react-native';

import { type SemanticColors, type Theme, type TypographyVariant, useStyles } from '@/theme';

export type TypographyColor = Extract<
  keyof SemanticColors,
  | 'textPrimary'
  | 'textSecondary'
  | 'textDisabled'
  | 'primary'
  | 'onPrimary'
  | 'secondary'
  | 'onSecondary'
  | 'error'
  | 'onError'
  | 'success'
  | 'warning'
  | 'info'
>;

export type TypographyProps = Omit<TextProps, 'style'> & {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
  /** Layout-only escape hatch (margins, flex, alignSelf). Visual props belong to variants. */
  style?: StyleProp<ViewStyle>;
};

const ALIGN = { left: 'alignLeft', center: 'alignCenter', right: 'alignRight' } as const;

/** The ONLY legal text renderer (§A7). */
export function Typography({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  children,
  style,
  ...rest
}: TypographyProps) {
  const styles = useStyles(createStyles);
  return (
    <Text {...rest} style={[styles[variant], styles[color], styles[ALIGN[align]], style]}>
      {children}
    </Text>
  );
}

function colorStyles(colors: SemanticColors) {
  const entries = Object.entries(colors).map(([key, value]) => [key, { color: value }]);
  return Object.fromEntries(entries) as Record<keyof SemanticColors, { color: string }>;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    ...theme.typography,
    ...colorStyles(theme.colors),
    alignLeft: { textAlign: 'left' },
    alignCenter: { textAlign: 'center' },
    alignRight: { textAlign: 'right' },
  });
