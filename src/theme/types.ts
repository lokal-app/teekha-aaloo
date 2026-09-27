import type { TextStyle, ViewStyle } from 'react-native';

/** The semantic color contract. Key set is FIXED by the Constitution (§A7) — extending = ADR. */
export type SemanticColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  error: string;
  onError: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  divider: string;
  overlay: string;
};
export type SemanticColorKey = keyof SemanticColors;

export type SpacingKey = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
export type SpacingScale = Record<SpacingKey, number>;

export type TypographyVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'bodyLg' | 'body' | 'bodySm' | 'label' | 'caption' | 'button';
export type TypographyStyle = {
  /** undefined = platform system font until the Figma font family is synced. */
  fontFamily: string | undefined;
  fontSize: number;
  lineHeight: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  letterSpacing: number;
};
export type TypographyScale = Record<TypographyVariant, TypographyStyle>;

export type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type RadiusScale = Record<RadiusKey, number>;

export type ShadowKey = 'none' | 'sm' | 'md' | 'lg';
export type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;
export type ShadowScale = Record<ShadowKey, ShadowStyle>;

export type ColorScheme = 'light' | 'dark';
export type ColorSchemePreference = ColorScheme | 'system';

/** Authoring shape: what themes/*.ts declare. Always carries BOTH schemes. */
export type ThemeSpec = {
  colors: Record<ColorScheme, SemanticColors>;
  spacing: SpacingScale;
  typography: TypographyScale;
  radius: RadiusScale;
  shadows: ShadowScale;
};

/** Resolved theme: what createStyles(theme) receives. */
export type Theme = {
  name: string;
  scheme: ColorScheme;
  colors: SemanticColors;
  spacing: SpacingScale;
  typography: TypographyScale;
  radius: RadiusScale;
  shadows: ShadowScale;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
