---
paths:
  - "src/**/*.tsx"
---
# Styling rules (absolute, every component and screen)
- NO inline styles. `style={{…}}` is forbidden — no exceptions, not even "temporary".
- The only legal pattern: `const styles = useStyles(createStyles)` +
  `const createStyles = (theme: Theme) => StyleSheet.create({…})`.
  Placement by file type: components → in-file last declaration; screens → the screen
  folder's styles.ts (which exports createStyles and NOTHING else).
- Conditional styles: arrays — `[styles.root, isActive && styles.active]`.
- Runtime values (insets, measured layout, API-sourced colors): `createStyles(theme, params)` +
  `useStyles(createStyles, params)` with a small flat params object. Animations:
  `[styles.x, animatedStyle]` from `useAnimatedStyle`. No other dynamic-style path exists.
- Every value from `theme` tokens. No raw hex/rgb, no off-scale numbers, no raw fontSize.
- Text only via `<Typography variant="…">`.
- If Figma shows a value with no token: stop and flag it to design. Never approximate.
