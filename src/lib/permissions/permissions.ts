import { Linking } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

/** Deep-links to the OS settings page for this app (recovery path for 'blocked'). */
export function openAppSettings(): Promise<void> {
  return Linking.openSettings();
}

/**
 * iOS App Tracking Transparency prompt — §A13 component-mount slot.
 * TODO(att): wire expo-tracking-transparency (dependency needs §A0 approval) and map its status.
 */
export async function requestTrackingPermission(): Promise<PermissionStatus> {
  return 'unavailable';
}
