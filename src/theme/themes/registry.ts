import type { ThemeSpec } from '../types';
import { defaultTheme } from './default';

/** Adding a skin = themes/<name>.ts + ONE line here. Nothing else changes (§A7). */
export const themes = {
  default: defaultTheme,
} satisfies Record<string, ThemeSpec>;

export type ThemeName = keyof typeof themes;

export const DEFAULT_THEME: ThemeName = 'default';

export function isThemeName(value: string): value is ThemeName {
  return Object.prototype.hasOwnProperty.call(themes, value);
}
