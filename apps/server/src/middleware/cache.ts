import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Initialize cache with default TTL of 60 seconds
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false
});

// Cache keys are prefixed by their type for better organization
const CACHE_KEYS = {
  TOKENS: 'tokens',
  ROUTES: 'routes',
  BRIDGE_QUOTE: 'bridge_quote',
  TOKEN_DATA: 'token_data'
} as const;

export const buildCacheKey = (type: keyof typeof CACHE_KEYS, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => ({
      ...acc,
      [key]: params[key]
    }), {});
  
  return `${CACHE_KEYS[type]}:${JSON.stringify(sortedParams)}`;
};

export const cacheMiddleware = (duration: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for POST requests that modify state
    if (req.method === 'POST' && !req.path.includes('/quote')) {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original json function
    const originalJson = res.json;
    
    // Override json function
    res.json = function(body: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, body, duration);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export const invalidateCache = (pattern: string) => {
  const keys = cache.keys().filter(key => key.includes(pattern));
  keys.forEach(key => cache.del(key));
};

export { cache };
