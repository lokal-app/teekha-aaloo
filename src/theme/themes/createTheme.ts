import type { DeepPartial, ThemeSpec } from '../types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, overrides: DeepPartial<T> | undefined): T {
  if (!overrides) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] =
      isPlainObject(current) && isPlainObject(value) ? deepMerge(current, value) : value;
  }
  return result as T;
}

/** A skin = createTheme(defaultTheme, overrides): declare only what changes (§A7). */
export function createTheme(base: ThemeSpec, overrides: DeepPartial<ThemeSpec>): ThemeSpec {
  return deepMerge(base, overrides);
}
