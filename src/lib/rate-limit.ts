import fs from 'fs';
import path from 'path';

// ── Config ──
const SESSION_LIMIT = parseInt(process.env.RATE_LIMIT_PER_SESSION || '10', 10);
const DAILY_LIMIT = parseInt(process.env.RATE_LIMIT_DAILY || '100', 10);

// ── Persistent global counter (survives server restarts) ──
const COUNTER_FILE = path.join(process.cwd(), '.daily-counter.json');

type DailyCounter = {
  date: string; // YYYY-MM-DD
  count: number;
};

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readGlobalCounter(): DailyCounter {
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf-8');
    const data: DailyCounter = JSON.parse(raw);
    if (data.date === getTodayStr()) {
      return data;
    }
  } catch {
    // File doesn't exist or is corrupted — start fresh
  }
  return { date: getTodayStr(), count: 0 };
}

function writeGlobalCounter(counter: DailyCounter): void {
  try {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify(counter), 'utf-8');
  } catch (err) {
    console.error('Failed to write daily counter:', err);
  }
}

// ── In-memory session limiter (secondary defense) ──
type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

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

function getOrCreateSession(sessionId: string): RateLimitEntry {
  const key = `session:${sessionId}`;
  const existing = store.get(key);
  const ONE_HOUR = 60 * 60 * 1000;
  if (existing && Date.now() < existing.resetAt) {
    return existing;
  }
  const entry = { count: 0, resetAt: Date.now() + ONE_HOUR };
  store.set(key, entry);
  return entry;
}

// ── Public API ──
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
  // 1. HARD global daily limit — file-based, survives restarts
  const globalCounter = readGlobalCounter();
  const sessionEntry = getOrCreateSession(sessionId);

  const dailyRemaining = Math.max(0, DAILY_LIMIT - globalCounter.count);
  const sessionRemaining = Math.max(0, SESSION_LIMIT - sessionEntry.count);

  // Check global daily limit FIRST (hardest defense)
  if (globalCounter.count >= DAILY_LIMIT) {
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

  // 2. Increment BOTH counters atomically
  globalCounter.count++;
  writeGlobalCounter(globalCounter);

  sessionEntry.count++;
  store.set(`session:${sessionId}`, sessionEntry);

  return {
    allowed: true,
    reason: null,
    sessionRemaining: SESSION_LIMIT - sessionEntry.count,
    dailyRemaining: DAILY_LIMIT - globalCounter.count,
  };
}
