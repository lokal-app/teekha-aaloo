import { focusManager, onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppState } from 'react-native';

export function setupReactQueryNative() {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener('change', (state) => setFocused(state === 'active'));
    return () => sub.remove();
  });
  onlineManager.setEventListener((setOnline) => {
    const sub = Network.addNetworkStateListener((state) => setOnline(!!state.isConnected));
    return () => sub.remove();
  });
}
