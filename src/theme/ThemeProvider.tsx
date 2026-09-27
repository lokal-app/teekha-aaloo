import { createContext, type ReactNode, use } from 'react';
import { useColorScheme } from 'react-native';

import { DEFAULT_THEME, isThemeName, themes } from './themes/registry';
import type { ColorScheme, ColorSchemePreference, Theme } from './types';

const ThemeContext = createContext<Theme | null>(null);

type Props = {
  /** Persisted in stores/settings (may be remote-config driven); unknown names fall back to DEFAULT_THEME. */
  themeName: string;
  colorScheme: ColorSchemePreference;
  children: ReactNode;
};

/** Resolves registry[themeName] × colorScheme. theme/ imports nothing from src/ — inputs arrive as props. */
export function ThemeProvider({ themeName, colorScheme, children }: Props) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme =
    colorScheme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : colorScheme;
  const name = isThemeName(themeName) ? themeName : DEFAULT_THEME;
  const spec = themes[name];
  const theme: Theme = {
    name,
    scheme,
    colors: spec.colors[scheme],
    spacing: spec.spacing,
    typography: spec.typography,
    radius: spec.radius,
    shadows: spec.shadows,
  };
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  const theme = use(ThemeContext);
  if (!theme)
    throw new Error(
      'useTheme must be used inside <ThemeProvider> (mounted in providers/index.tsx).',
    );
  return theme;
}
