# src/navigation/ — locked three-state root (§A8)

| File | Role |
|---|---|
| `RootNavigator.tsx` | switches ONLY on `authStore.status`: restoring → splash, unauthenticated, authenticated |
| `unauthenticated/UnauthenticatedStack.tsx` | Intro (initial when `!hasSeenIntro`), Login, Registration `Stack.Group` |
| `authenticated/AuthenticatedStack.tsx` | `Tabs` (BottomTabsNavigator) + pushed screens + modal `Stack.Group` |
| `*/types.ts`, `types.ts` | typed ParamLists + the global `ReactNavigation.RootParamList` |
| `navigationRef.ts` | the only out-of-React navigation |
| `linking.ts` | deep-link config (`<scheme>://`) |

**Bare boot:** `unauthenticated/PlaceholderScreen.tsx` is a TEMPORARY route — delete it (and its
`Placeholder` ParamList entry + `navigation.placeholder.*` strings) when the first real screen is registered.
**Rules:** screens never import navigators; navigation calls live in screen data hooks; params
always typed; `as never` forbidden; feature navigators mount as single screens in AuthenticatedStack.
Route registration: `/create-screen` or the flow-wirer agent.
