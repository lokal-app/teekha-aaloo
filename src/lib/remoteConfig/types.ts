export type RemoteConfigAdapter = {
  /** Fetch + activate. Must never throw past its own timeout — defaults apply on failure. */
  load(): Promise<void>;
  getFlag(key: string, fallback: boolean): boolean;
  getString(key: string, fallback: string): string;
  getNumber(key: string, fallback: number): number;
};
