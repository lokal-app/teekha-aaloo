import type { SpacingScale } from '../types';

// PLACEHOLDER — replace via /figma-implement token sync (4-pt grid expected)
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const satisfies SpacingScale;
