# components/shell/ — the app shell Kagaz deliberately leaves to apps (CLOSED list)
Exactly six: Screen, LoadingState, ErrorState, EmptyState, BottomSheet/, ToastMessage + index.ts.
A seventh file fails lint (design-system/locked-folders); extending = ADR proving Kagaz won't own it.
Built ONLY from @/components/ui (Spinner, Text, Button, FloatingSnackbar, VStack…)
+ createStyles(tokens) + the one locked-stack lib each wraps (safe-area-context,
keyboard-controller, @gorhom/bottom-sheet, react-native-flash-message). Imports: theme/,
utils/, @/components/ui, that lib — nothing else (never a brand-only component: shell is brand-neutral). Contract: named export + exported <Name>Props; text
arrives via props (NEVER t() here); no business logic, data, stores or navigation; style prop
layout-only, merged last. Screen owns safe area, page background (surface.page.default), status
bar style (useTheme().mode) and keyboard-aware scrolling (the Kagaz tab bar is solid: no inset).
ToastMessage renders Kagaz FloatingSnackbar for react-native-flash-message (mounted in providers/);
showToast() lives in lib/toast and is called from data hooks only.
