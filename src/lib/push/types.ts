export type PushNotification = {
  id: string;
  title?: string;
  body?: string;
  data: Record<string, unknown>;
};

export type Unsubscribe = () => void;

export type PushAdapter = {
  /** Module-load, synchronous: Android channels + iOS VoIP/foreground handlers (§A13). */
  registerNotificationHandlers(): void;
  init(): Promise<void>;
  getToken(): Promise<string | null>;
  onNotificationOpened(listener: (notification: PushNotification) => void): Unsubscribe;
};
