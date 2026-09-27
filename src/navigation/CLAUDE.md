# navigation/ — locked three-state root
RootNavigator switches ONLY on authStore.status: restoring | unauthenticated | authenticated.
Intro slider = initialRouteName of UnauthenticatedStack when !hasSeenIntro (persisted flag) —
NOT a root state. Registration = Stack.Group, one route per step, cross-step state in
stores/registration (reset on completion). Every navigator owns types.ts; params always typed;
`as never` forbidden. navigationRef is the only out-of-React navigation. Screens never import
navigators — navigation calls live in screen data hooks.
