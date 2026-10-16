import { type KagazTokens, useTokens } from '@lokal-app/kagaz-components';
import { useMemo, useState } from 'react';

type StyleParams = Record<string, string | number | boolean | undefined>;

/**
 * The memoized createStyles consumer. Re-runs the factory only when the tokens (brand/skin/mode)
 * change or `params` changes by shallow equality. `factory` must be module-scoped (stable).
 */
export function useStyles<S>(factory: (tokens: KagazTokens) => S): S;
export function useStyles<S, P extends StyleParams>(
  factory: (tokens: KagazTokens, params: P) => S,
  params: P,
): S;
export function useStyles<S, P extends StyleParams>(
  factory: (tokens: KagazTokens, params?: P) => S,
  params?: P,
): S {
  const tokens = useTokens();
  const stableParams = useShallowStable(params);
  return useMemo(() => factory(tokens, stableParams), [factory, tokens, stableParams]);
}

function useShallowStable<P extends StyleParams | undefined>(value: P): P {
  const [stable, setStable] = useState(value);
  if (!shallowEqual(stable, value)) {
    setStable(value);
    return value;
  }
  return stable;
}

function shallowEqual(a: StyleParams | undefined, b: StyleParams | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}
