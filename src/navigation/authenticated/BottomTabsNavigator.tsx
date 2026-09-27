import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import type { BottomTabsParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabsParamList>();

/** Register tabs with /create-screen <area> <screen> tabs — at least one before auth ships. */
export function BottomTabsNavigator() {
  return <Tab.Navigator screenOptions={{ headerShown: false }}>{null}</Tab.Navigator>;
}
