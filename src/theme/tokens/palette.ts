// PLACEHOLDER — replace via /figma-implement token sync
// Raw color values live HERE and nowhere else. Names mirror Figma variables. Append-only.
export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#030712',
  orange300: '#FDBA74',
  orange500: '#F97316',
  orange600: '#EA580C',
  blue300: '#93C5FD',
  blue500: '#3B82F6',
  red300: '#FCA5A5',
  red600: '#DC2626',
  green400: '#4ADE80',
  green600: '#16A34A',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  sky400: '#38BDF8',
  sky600: '#0284C7',
  blackAlpha50: '#00000080',
  blackAlpha70: '#000000B3',
} as const;

export type PaletteColor = keyof typeof palette;
