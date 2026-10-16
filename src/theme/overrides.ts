import { defineThemeOverrides } from '@lokal-app/kagaz-components';

/**
 * App-wide createTheme overrides (§A7.2). Ships empty. Every entry must cite its Figma node and
 * the design sign-off in a comment. Prefer `brand` values (they follow in both modes), then
 * `tokens.{light,dark}`, then `components`. An override more than one app needs is a Kagaz change.
 */
export const overrides = defineThemeOverrides({});
