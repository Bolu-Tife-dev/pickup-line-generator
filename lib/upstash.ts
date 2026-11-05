import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "./supabase/server";

// Only build the limiter when Upstash is actually configured; when the user
// hasn't signed up for Upstash yet, rate limiting degrades to "always allow"
// instead of erroring the Regenerate button.
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL?.includes(".upstash.io") &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== "demo-token";

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(3, "30 m"),
    })
  : null;

export async function rateLimiter() {
  // userId from supabase AUTH
  const supabase = createClient();

  if (!ratelimit) {
    console.warn("Upstash is not configured — skipping rate limiting");
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
      error: null as string | null,
    };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error("Failed to get user");
  }

  if (!data.user?.id) {
    throw new Error("User ID not found");
  }

  const identifier = data.user?.id!;
  const { success, limit, remaining, reset } =
    await ratelimit.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
    error: success ? null : "Rate limit exceeded",
  };
}
