import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from './PlaceholderScreen';
import type { UnauthenticatedStackParamList } from './types';

const Stack = createNativeStackNavigator<UnauthenticatedStackParamList>();

/**
 * Pre-auth flow: Intro (first launch only) → Login → Registration steps.
 * TODO(intro): initialRouteName = hasSeenIntro (useAuthStore) ? 'Login' : 'Intro' once both exist.
 */
export function UnauthenticatedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
      {/* Registration — one route per step (RegistrationName, RegistrationOtp, …); state in stores/registration. */}
      <Stack.Group>{null}</Stack.Group>
    </Stack.Navigator>
  );
}
