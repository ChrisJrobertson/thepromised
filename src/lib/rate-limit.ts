import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialise Redis lazily so missing env vars only throw at call time,
// not at module load time (avoids breaking the build in environments where
// the keys haven't been configured yet).
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

let _aiLimiter: Ratelimit | null = null;
let _enquiryLimiter: Ratelimit | null = null;

function getLimiter(type: "ai" | "enquiry"): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (type === "ai") {
    if (!_aiLimiter) {
      _aiLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        analytics: true,
        prefix: "ratelimit:ai",
      });
    }
    return _aiLimiter;
  }

  if (!_enquiryLimiter) {
    _enquiryLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:enquiry",
    });
  }
  return _enquiryLimiter;
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
  headers: Record<string, string>;
};

/**
 * Checks the rate limit for the given identifier.
 *
 * Falls back to always-allowed when Upstash env vars are not configured
 * (e.g. local development without Redis). In production, UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN must be set.
 */
export async function checkRateLimit(
  identifier: string,
  type: "ai" | "enquiry"
): Promise<RateLimitResult> {
  const limiter = getLimiter(type);

  if (!limiter) {
    // Graceful fallback — allow all requests when Redis is not configured.
    // This should not happen in production.
    return {
      success: true,
      limit: 999,
      reset: Date.now() + 60_000,
      remaining: 999,
      headers: {
        "X-RateLimit-Limit": "999",
        "X-RateLimit-Remaining": "999",
        "X-RateLimit-Reset": String(Date.now() + 60_000),
      },
    };
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}
