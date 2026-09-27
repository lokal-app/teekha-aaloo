import { palette } from '../tokens/palette';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import type { ThemeSpec } from '../types';

// PLACEHOLDER — replace via /figma-implement token sync
// The COMPLETE base spec: every semantic key for BOTH light and dark (§A7 dark-mode mandate).
export const defaultTheme: ThemeSpec = {
  colors: {
    light: {
      background: palette.white,
      surface: palette.gray50,
      surfaceElevated: palette.white,
      textPrimary: palette.gray900,
      textSecondary: palette.gray600,
      textDisabled: palette.gray400,
      primary: palette.orange600,
      onPrimary: palette.white,
      secondary: palette.gray800,
      onSecondary: palette.white,
      error: palette.red600,
      onError: palette.white,
      success: palette.green600,
      warning: palette.amber500,
      info: palette.sky600,
      border: palette.gray300,
      divider: palette.gray200,
      overlay: palette.blackAlpha50,
    },
    dark: {
      background: palette.gray950,
      surface: palette.gray900,
      surfaceElevated: palette.gray800,
      textPrimary: palette.gray50,
      textSecondary: palette.gray400,
      textDisabled: palette.gray600,
      primary: palette.orange500,
      onPrimary: palette.gray950,
      secondary: palette.gray200,
      onSecondary: palette.gray900,
      error: palette.red300,
      onError: palette.gray950,
      success: palette.green400,
      warning: palette.amber400,
      info: palette.sky400,
      border: palette.gray700,
      divider: palette.gray800,
      overlay: palette.blackAlpha70,
    },
  },
  spacing,
  typography,
  radius,
  shadows,
};
