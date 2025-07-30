import rateLimit from 'express-rate-limit';

// Global rate limiter for all API endpoints
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for heavy operations like swaps and quotes
export const swapLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour
  message: { success: false, error: 'Swap request limit exceeded, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for cross-chain operations
export const bridgeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 cross-chain operations per hour
  message: { success: false, error: 'Bridge request limit exceeded, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
