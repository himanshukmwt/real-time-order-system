import redis from "../config/redis.js";
import { AppError } from "../utils/AppError.js";

const incrementScript = `
  local count = redis.call("INCR", KEYS[1])

  if count == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end

  local ttl = redis.call("TTL", KEYS[1])
  return {count, ttl}
`;

export function rateLimiter({
  keyPrefix,
  windowSec = 60,
  max,
  getId,
  failOpen = true,
}) {
  return async (req, res, next) => {
    try {
      const id = getId(req);

      if (id === undefined || id === null || id === "") {
        return next(new AppError("Rate limit identifier missing", 500));
      }

      const key = `rl:${keyPrefix}:${id}`;

      const [countResult, ttlResult] = await redis.eval(
        incrementScript,
        1,
        key,
        windowSec
      );

      const count = Number(countResult);
      const ttl = Number(ttlResult);

      res.set("X-RateLimit-Limit", String(max));
      res.set(
        "X-RateLimit-Remaining",
        String(Math.max(0, max - count))
      );

      if (count > max) {
        res.set("Retry-After", String(Math.max(1, ttl)));

        return next(
          new AppError(
            "Too many requests, please try again later",
            429
          )
        );
      }

      return next();
    } catch (err) {
      console.error("Rate limiter Redis error:", err.message);

      // Fail-open: allow request if Redis is unavailable.
      if (failOpen) return next();

      // Fail-closed: block request if Redis is unavailable.
      return next(
        new AppError("Request protection temporarily unavailable", 503)
      );
    }
  };
}

// General API: 100 requests per IP per 60 seconds
export const globalIpLimiter = rateLimiter({
  keyPrefix: "ip",
  windowSec: 60,
  max: 100,
  getId: (req) => req.ip,
});

// Login/register: 5 requests per IP per 60 seconds
export const authIpLimiter = rateLimiter({
  keyPrefix: "auth",
  windowSec: 60,
  max: 5,
  getId: (req) => req.ip,
  failOpen: false,
});

// Authenticated users: 30 requests per user per 60 seconds
export const userLimiter = rateLimiter({
  keyPrefix: "user",
  windowSec: 60,
  max: 30,
  getId: (req) => req.user.userId,
});

// Orders: 5 requests per user per 60 seconds
export const orderLimiter = rateLimiter({
  keyPrefix: "order",
  windowSec: 60,
  max: 5,
  getId: (req) => req.user.userId,
});