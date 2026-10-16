// The ONE public theme surface (§A7.2). Kagaz components are NOT re-exported here — they come
// from the component gateway @/components/ui (§A7.8).
export { brand } from './brand';
export { navigationThemes } from './navigationTheme';
export { DEFAULT_THEME, type ThemeName, themes } from './registry';
export { useStyles } from './useStyles';
export type { Mode, KagazTokens as Tokens } from '@lokal-app/kagaz-components';
export { ThemeProvider, useTheme, useTokens } from '@lokal-app/kagaz-components';
