type RateLimitEntry = { count: number; resetAt: number };

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();
  private readonly maximumRequests: number;
  private readonly windowMilliseconds: number;

  constructor(maximumRequests: number, windowMilliseconds: number) {
    this.maximumRequests = maximumRequests;
    this.windowMilliseconds = windowMilliseconds;
  }

  check(key: string, now = Date.now()) {
    const entry = this.entries.get(key);
    if (!entry || entry.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMilliseconds });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (entry.count >= this.maximumRequests) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
    }
    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
