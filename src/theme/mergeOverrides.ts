import type { ThemeOverrides } from '@lokal-app/kagaz-components';

type Tree = Record<string, unknown>;

function isTree(value: unknown): value is Tree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge(base: unknown, patch: unknown): unknown {
  if (!isTree(base) || !isTree(patch)) return patch === undefined ? base : patch;
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(patch)) out[key] = merge(out[key], value);
  return out;
}

/** The app overrides with a skin layered on top (objects merge, anything else replaces). */
export function mergeOverrides(base: ThemeOverrides, skin: ThemeOverrides): ThemeOverrides {
  return merge(base, skin) as ThemeOverrides;
}
