interface MemoryRateRecord {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  namespace: string;
  identifier: string;
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

const memoryStore: Map<string, MemoryRateRecord> = new Map();

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function buildKey(namespace: string, identifier: string): string {
  return `ratelimit:${namespace}:${identifier}`;
}

async function runUpstashCommand(command: string, ...args: string[]): Promise<number> {
  if (!upstashUrl || !upstashToken) {
    throw new Error('Upstash is not configured');
  }

  const path = [command, ...args.map((value) => encodeURIComponent(value))].join('/');
  const response = await fetch(`${upstashUrl.replace(/\/+$/, '')}/${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${upstashToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Upstash command failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result?: unknown };
  const value = payload.result;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

async function applyUpstashRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { namespace, identifier, windowMs, max } = options;
  const key = buildKey(namespace, identifier);
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  const count = await runUpstashCommand('incr', key);
  if (count === 1) {
    await runUpstashCommand('expire', key, String(windowSeconds));
  }

  if (count > max) {
    const ttlSeconds = await runUpstashCommand('ttl', key);
    const retryAfter = ttlSeconds > 0 ? ttlSeconds : windowSeconds;
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

function applyMemoryRateLimit(options: RateLimitOptions): RateLimitResult {
  const { namespace, identifier, windowMs, max } = options;
  const key = buildKey(namespace, identifier);
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || now > current.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true };
}

export async function applyRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  if (upstashUrl && upstashToken) {
    try {
      return await applyUpstashRateLimit(options);
    } catch (error) {
      console.error('Upstash rate limit fallback to memory:', error);
    }
  }

  return applyMemoryRateLimit(options);
}
