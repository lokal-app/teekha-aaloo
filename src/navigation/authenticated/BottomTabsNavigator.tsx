import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarOptions } from '@/components/ui';

import type { BottomTabsParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabsParamList>();

/**
 * The Kagaz tab bar: React Navigation's own bar, styled by Kagaz (solid, no blur). Register tabs
 * with /create-screen <area> <screen> tabs — each with tabItem({ label: t(...), icon, activeIcon }).
 */
export function BottomTabsNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarOptions = useTabBarOptions({ bottomInset: insets.bottom });
  return (
    <Tab.Navigator screenOptions={{ ...tabBarOptions, headerShown: false }}>{null}</Tab.Navigator>
  );
}
