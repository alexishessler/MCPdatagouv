type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const SESSION_LIMIT = parseInt(process.env.RATE_LIMIT_PER_SESSION || '5', 10);
const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_DAILY || '50', 10);

// Cleanup expired entries every 10 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    });
  };
  if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 10 * 60 * 1000);
  }
}

function getOrCreate(key: string, ttlMs: number): RateLimitEntry {
  const existing = store.get(key);
  if (existing && Date.now() < existing.resetAt) {
    return existing;
  }
  const entry = { count: 0, resetAt: Date.now() + ttlMs };
  store.set(key, entry);
  return entry;
}

export type RateLimitResult = {
  allowed: boolean;
  reason: 'session' | 'daily' | null;
  sessionRemaining: number;
  dailyRemaining: number;
};

export function checkRateLimit(
  ip: string,
  sessionId: string
): RateLimitResult {
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const dailyEntry = getOrCreate('daily:global', ONE_DAY);
  const sessionEntry = getOrCreate(`session:${sessionId}`, ONE_HOUR);

  const sessionRemaining = Math.max(0, SESSION_LIMIT - sessionEntry.count);
  const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyEntry.count);

  // Check daily limit
  if (dailyEntry.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'daily',
      sessionRemaining,
      dailyRemaining: 0,
    };
  }

  // Check session limit
  if (sessionEntry.count >= SESSION_LIMIT) {
    return {
      allowed: false,
      reason: 'session',
      sessionRemaining: 0,
      dailyRemaining,
    };
  }

  // Increment
  sessionEntry.count++;
  dailyEntry.count++;
  store.set(`session:${sessionId}`, sessionEntry);
  store.set('daily:global', dailyEntry);

  return {
    allowed: true,
    reason: null,
    sessionRemaining: SESSION_LIMIT - sessionEntry.count,
    dailyRemaining: DAILY_LIMIT - dailyEntry.count,
  };
}
