import type { NavigatorScreenParams } from '@react-navigation/native';

/** Tab routes are added here by /create-screen <area> <screen> tabs. */
export type BottomTabsParamList = Record<string, never>;

/** Tabs + pushed screens + modal-group routes + mounted feature navigators (§A8). */
export type AuthenticatedStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabsParamList>;
};
