# src/components/ui/ — the design system

**Purpose:** the ONLY place raw building blocks (RN built-ins, @gorhom/bottom-sheet, FlashList,
expo-image, vector icons) are wrapped, token-bound and variant-typed (§A7.1).
**Shipped (the standard 13):** Screen, Typography, Icon, Button, TextField, Checkbox, Switch,
BottomSheet/, Divider, LoadingState, ErrorState, EmptyState, ToastMessage — all registered in `index.ts`.
**Contract:** named export + `<Name>Props`; `variant`/`size` token-derived unions; semantic tokens
only via the theme object; a11y defaults built in (44pt targets); text via props (never `t()`);
`style` prop is LAYOUT-ONLY, merged last; imports only `theme/`, `utils/`, sibling primitives.
**Does NOT:** business logic, data, navigation, Spacer/Box/Row layout primitives (use `gap`).
**Lint:** `import/no-restricted-paths` (ui zone), `design-system/*`, `no-layer-root-barrels`.
**Customization:** per-app via token values only (Figma sync) — never structural edits.
