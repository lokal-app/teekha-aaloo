# navigation/ — locked three-state root, Kagaz chrome
RootNavigator renders NavigationContainer (navigationRef, linking, theme =
navigationThemes[themeName][mode] from @/theme) and switches ONLY on authStore.status:
restoring | unauthenticated | authenticated. Intro slider = initialRouteName of
UnauthenticatedStack when !hasSeenIntro (persisted flag) — NOT a root state. Registration =
Stack.Group, one route per step, cross-step state in stores/registration (reset on completion).
Bottom tabs: React Navigation's own bar styled by Kagaz (helpers from @/components/ui) — screenOptions={{ ...useTabBarOptions(
{ bottomInset: insets.bottom }), headerShown: false }} (solid bar, no blur) and per tab tabItem({ label: t(),
icon, activeIcon, badgeCount, badgeAccessibilityLabel }). Never a custom tabBar, never Kagaz
BottomNav in a navigator. Every navigator owns types.ts; params always typed; `as never`
forbidden. navigationRef is the only out-of-React navigation. Screens never import
navigators — navigation calls live in screen data hooks.
