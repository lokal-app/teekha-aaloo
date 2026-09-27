import type { TypographyScale } from '../types';

// PLACEHOLDER — replace via /figma-implement token sync (Figma text styles).
// fontFamily undefined = platform system font until the design font is added to assets/fonts/.
export const typography = {
  display: {
    fontFamily: undefined,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: 0,
  },
  h1: { fontFamily: undefined, fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: 0 },
  h2: { fontFamily: undefined, fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: 0 },
  h3: { fontFamily: undefined, fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: 0 },
  bodyLg: {
    fontFamily: undefined,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
    letterSpacing: 0,
  },
  body: {
    fontFamily: undefined,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: undefined,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
  label: {
    fontFamily: undefined,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: undefined,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: undefined,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
} as const satisfies TypographyScale;
