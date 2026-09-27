# src/screens/ — two-level: screens/<area>/<screen>/

**Purpose:** one folder per screen, grouped by product area (`auth/`, `home/`, …).
**Goes here:** `<Name>Screen.tsx` (render only, ONE component), `use<Name>Screen.ts` (ALL wiring,
`status` + `retry`), `styles.ts` (`createStyles` ONLY), `index.ts` (barrel), optional
`useTrack.ts`, `constants.ts`, `components/`, `variants/` (§A6.1).
**Does NOT go here:** components shared by ≥2 screens (→ `components/<area>/`), navigators
(→ `navigation/`), `screens/index.ts` (forbidden — would execute every screen at startup).
**Lint:** `design-system/styles-pattern` (styles.ts), `react-native/no-inline-styles`,
`i18next/no-literal-string`, `max-lines` (250 per .tsx, 150 per hook).
**Scaffold:** `/create-screen <area> <screen-name> [navigator]`.
Ships EMPTY in the template — the first real screen replaces `navigation/unauthenticated/PlaceholderScreen.tsx`.
