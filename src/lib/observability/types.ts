export type Trace = {
  setAttribute(key: string, value: string | number): void;
  stop(): void;
};

export type ObservabilityAdapter = {
  init(): Promise<void>;
  startTrace(name: string): Trace;
};
