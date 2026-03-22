interface Window {
  amplitude?: {
    setUserId(userId: string): void;
    track(eventName: string, properties?: Record<string, unknown>): void;
    getDeviceId(): string;
    getSessionId(): number;
  };
}
