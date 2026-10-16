# screens/ — two-level: screens/<area>/<screen>/

Files: <Name>Screen.tsx (render ONLY, exactly ONE component — others go to ./components/;
no queries, stores, navigation, or analytics), use<Name>Screen.ts (ALL wiring; typed
useNavigation inside — screens never take a navigation prop; returns one object incl.
status: loading|error|empty|ready + retry), styles.ts (exports createStyles(tokens) ONLY —
constants go to constants.ts), index.ts, optional useTrack.ts (≥2 analytics events: thin
lib/analytics wrapper, base payload once, called only from the data hook), optional
constants.ts (snap points, Figma content dimensions with node cited), optional components/,
optional variants/ (A/B: presentation-only variants sharing ONE data hook, ONE route, ONE
useTrack; the screen file is the switcher; sibling -v2 screen folders forbidden).
UI = Kagaz, imported ONLY from @/components/ui (shared + brand-only pieces), layout
via VStack/HStack/Box token props, text via Kagaz <Text variant color>, all labels via t().
Wrap in ONE shell <Screen>; branch all four states with shell LoadingState/ErrorState/
EmptyState — never duplicate the layout tree per state. Form inputs are controlled Kagaz
inputs wired to react-hook-form in the data hook (value/onChangeText/error/errorText).
Component promotion: Kagaz ships it → import; 1 screen → ./components/; ≥2 screens same area →
components/<area>/; cross-area business → components/common/. Move, never copy.
NEVER create screens/index.ts (root barrel executes every screen at startup).
Scaffold with /create-screen (or /figma-implement from a Figma frame).
