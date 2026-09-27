export type CrashContext = Record<string, string | number | boolean | null | undefined>;

export type CrashAdapter = {
  init(): Promise<void>;
  recordError(error: unknown, context?: CrashContext): void;
  log(message: string): void;
  setUser(userId: string | null): void;
};
