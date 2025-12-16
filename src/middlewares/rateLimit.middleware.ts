import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

// Global rate limiter middleware
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  standardHeaders: true, // Send RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers

  // Properly handle IPv4 and IPv6
  keyGenerator: (req: Request): string => ipKeyGenerator(req as any),

  message: {
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
});
