/**
 * A simple rate-limiting queue to stay within API quotas (e.g., Gemini 15 RPM).
 */
class RequestQueue {
  private interval: number;
  private lastCall: number = 0;

  constructor(ratePerMinute = 12) {
    // We target 12 RPM to stay safely under the 15 RPM hard limit
    this.interval = (60 / ratePerMinute) * 1000;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const wait = Math.max(0, this.lastCall + this.interval - now);
    this.lastCall = now + wait;

    if (wait > 0) {
      console.log(`[QUEUE] Throttling request. Waiting ${wait}ms to stay under rate limit...`);
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  }
}

// Singleton instance for Gemini requests
export const geminiQueue = new RequestQueue(10);
