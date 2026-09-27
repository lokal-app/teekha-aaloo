export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/** The analytics contract. Event names are snake_case `<area>_<object>_<action>` (§A4). */
export type AnalyticsAdapter = {
  init(): Promise<void>;
  trackEvent(name: string, props?: AnalyticsProps): void;
  identify(userId: string, traits?: AnalyticsProps): void;
  setUserProperties(props: AnalyticsProps): void;
  reset(): void;
};
