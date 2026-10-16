import { adaptNavigationTheme } from '@lokal-app/kagaz-components/navigation';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { type ThemeName, themes } from './registry';

/** React Navigation's themes with Kagaz colours and fonts, per theme, built once (§A7.2 #6). */
export const navigationThemes = Object.fromEntries(
  Object.entries(themes).map(([name, theme]) => {
    const adapted = adaptNavigationTheme(theme, { light: DefaultTheme, dark: DarkTheme });
    return [name, { light: adapted.LightTheme, dark: adapted.DarkTheme }];
  }),
) as Record<ThemeName, { light: typeof DefaultTheme; dark: typeof DarkTheme }>;
