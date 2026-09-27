import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BottomTabsNavigator } from './BottomTabsNavigator';
import type { AuthenticatedStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthenticatedStackParamList>();

export function AuthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabsNavigator} />
      {/* Pushed screens go here; feature navigators mount as single screens via their barrel. */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>{null}</Stack.Group>
    </Stack.Navigator>
  );
}
