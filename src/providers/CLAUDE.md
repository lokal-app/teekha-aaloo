# providers/ — the single composition root (providers/index.tsx only)
Fixed order, outermost first: GestureHandlerRootView → SafeAreaProvider → KeyboardProvider →
QueryClientProvider → Kagaz ThemeProvider → BottomSheetModalProvider → children +
<FlashMessage MessageComponent={ToastMessage} />. ThemeProvider: theme={themes[themeName] ??
themes[DEFAULT_THEME]}; settings.colorScheme 'system' → followSystem, 'light'|'dark' → mode,
'brand' → neither (brand defaultMode). The ONLY place ThemeProvider is rendered. Nested
providers anywhere else are forbidden (a nested Kagaz ThemeProvider for a one-subtree mode
change needs an ADR).
