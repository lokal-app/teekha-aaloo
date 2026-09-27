# src/providers/ — the single composition root

**Goes here:** `providers/index.tsx` ONLY — every provider wrapper in one tree: ThemeProvider
(fed from `stores/settings`), GestureHandlerRootView, SafeAreaProvider, KeyboardProvider,
QueryClientProvider, BottomSheetModalProvider, the root ErrorBoundary, and the FlashMessage
toast host rendering `ui/ToastMessage`.
**Does NOT:** nested provider wrappers anywhere else in `src/` (§A11), business logic.
**Imports:** anything (it is the composition root, §A3).
