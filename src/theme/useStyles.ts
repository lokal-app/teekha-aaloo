import { useMemo, useState } from 'react';

import { useTheme } from './ThemeProvider';
import type { Theme } from './types';

type StyleParams = Record<string, string | number | boolean | null | undefined>;

function shallowEqual(a: StyleParams | undefined, b: StyleParams | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

/**
 * The memoized createStyles consumer (§A7). Re-runs the factory only when the theme changes
 * or `params` changes by shallow equality — pass a small flat object of primitives.
 */
export function useStyles<T>(factory: (theme: Theme) => T): T;
export function useStyles<T, P extends StyleParams>(
  factory: (theme: Theme, params: P) => T,
  params: P,
): T;
export function useStyles<T, P extends StyleParams>(
  factory: (theme: Theme, params?: P) => T,
  params?: P,
): T {
  const theme = useTheme();
  const [stableParams, setStableParams] = useState(params);
  if (!shallowEqual(stableParams, params)) {
    setStableParams(params);
  }
  return useMemo(() => factory(theme, stableParams), [factory, theme, stableParams]);
}
