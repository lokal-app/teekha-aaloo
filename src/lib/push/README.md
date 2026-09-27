# lib/push — adapter slot

**Contract:** `types.ts` (`PushAdapter`). **Public API:** `index.ts` —
`registerNotificationHandlers`, `initPush`, `getPushToken`, `onNotificationOpened`.
**Ships as:** no-op `adapter.ts`.

**Recommended vendor (pre-approved):** `expo-notifications` (FCM on Android, APNs on iOS).

**Wiring steps** (`/add-adapter push expo-notifications` → adapter-wirer):
1. User runs `! pnpm exec expo install expo-notifications expo-device`.
2. Add the `expo-notifications` plugin to `app.config.ts` (icon/color from theme palette values
   via the plugin config); FCM `google-services.json` per env; APNs key in EAS credentials.
3. Implement `adapter.ts`: `registerNotificationHandlers` = `setNotificationHandler` + Android
   `setNotificationChannelAsync`; `getToken` = `getExpoPushTokenAsync` or `getDevicePushTokenAsync`.
4. Bootstrap slots: §A13 module-load step 7 (`registerNotificationHandlers()`) and
   component-mount step 11 (`initPush()`) — both already called in `App.tsx`.
5. Deep-link routing on open goes through `navigationRef` (never import navigation into lib/ —
   the app subscribes via `onNotificationOpened` from spine code).

**Gotchas:** permission prompt timing is a product decision (ask via a screen data hook, not at boot).
