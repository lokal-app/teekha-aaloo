# components/ui/ — the design system
The ONLY place raw building blocks (RN built-ins + locked-stack libs) get wrapped and
token-bound. Atomic: no business logic, no API calls, no store reads, no navigation, no t()
EVER (text arrives via props). Contract per primitive: named export + <Name>Props exported;
variant/size as the standardized prop names, token-derived unions; SEMANTIC tokens only —
theme/tokens/* is theme-internal (palette legal only inside theme/themes/*); a11y defaults built in
(accessibilityRole/State, 44pt targets); style?: StyleProp<ViewStyle> merged last =
LAYOUT-ONLY (placement; any visual property in it is a violation — that's variants' job);
may compose sibling primitives, imports only theme/ + utils/ (NEVER theme/tokens/* —
theme-internal); createStyles tail in-file; flat <Name>.tsx until a 2nd file is needed,
then <Name>/ folder.
No Spacer/Box/Row primitives — sibling spacing via gap in createStyles.
Wrapping a NEW third-party UI kit = ADR. Text rendering exists ONLY here (Typography).
New primitive = /create-component + register in this folder's index.ts (the one curated
barrel). Toast: showToast() lives in lib/toast (imperative, renders nothing); ToastMessage.tsx renders here and
is mounted as the host in providers/index.tsx.
