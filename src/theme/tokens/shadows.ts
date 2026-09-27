import { Platform } from 'react-native';

import type { ShadowScale, ShadowStyle } from '../types';
import { palette } from './palette';

function shadow(elevation: number, offsetY: number, radius: number, opacity: number): ShadowStyle {
  return Platform.select<ShadowStyle>({
    android: { elevation },
    default: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  });
}

// PLACEHOLDER — replace via /figma-implement token sync (Figma effect styles)
export const shadows: ShadowScale = {
  none: shadow(0, 0, 0, 0),
  sm: shadow(1, 1, 2, 0.08),
  md: shadow(4, 2, 6, 0.12),
  lg: shadow(8, 6, 16, 0.16),
};
