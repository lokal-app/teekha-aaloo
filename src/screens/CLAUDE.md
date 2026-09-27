# screens/ — two-level: screens/<area>/<screen>/
Files: <Name>Screen.tsx (render ONLY, exactly ONE component — others go to ./components/;
no queries, stores, navigation, or analytics), use<Name>Screen.ts (ALL wiring; typed
useNavigation inside — screens never take a navigation prop; returns one object incl.
status: loading|error|empty|ready + retry), styles.ts (exports createStyles(theme) ONLY —
constants go to constants.ts), index.ts, optional useTrack.ts (≥2 analytics events: thin
lib/analytics wrapper, base payload once, called only from the data hook), optional
constants.ts, optional components/, optional variants/ (A/B: presentation-only variants
sharing ONE data hook, ONE route, ONE useTrack; the screen file is the switcher; sibling
-v2 screen folders forbidden).
Branch all four states inside one <Screen> wrapper with LoadingState/ErrorState/EmptyState —
never duplicate the layout tree per state.
Component promotion: 1 screen → ./components/; ≥2 screens same area → components/<area>/;
cross-area business → components/common/; atomic token-only → components/ui/. Move, never copy.
NEVER create screens/index.ts (root barrel executes every screen at startup).
Scaffold with /create-screen.
