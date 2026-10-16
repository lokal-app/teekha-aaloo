import { createTheme } from '@lokal-app/kagaz-components';

import { brand } from './brand';
import { overrides } from './overrides';

/**
 * Every theme the app can show, built ONCE at module scope (createTheme validates the brand and
 * throws loudly on a bad override). Adding a skin = skins/<name>.ts + ONE line here (/add-skin).
 */
export const themes = {
  default: createTheme(brand, overrides),
};

export type ThemeName = keyof typeof themes;

export const DEFAULT_THEME: ThemeName = 'default';
