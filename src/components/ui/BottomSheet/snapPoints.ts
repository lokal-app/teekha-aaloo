/** The fixed snap API: primitives expose sizes, never free-form snap points. */
export const SNAP_POINTS = {
  sm: ['25%'],
  md: ['50%'],
  lg: ['75%'],
  full: ['92%'],
} as const;

export type BottomSheetSize = keyof typeof SNAP_POINTS;
