import rateLimit from 'express-rate-limit';
import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Create rate limiter with Redis store
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message
      });
    },
    // Use Redis store if available
    store: redisClient.isConnected ? {
      async increment(key) {
        const current = await redisClient.incr(key);
        if (current === 1) {
          await redisClient.expire(key, Math.ceil(windowMs / 1000));
        }
        return {
          totalHits: current,
          resetTime: new Date(Date.now() + windowMs)
        };
      },
      async decrement(key) {
        const current = await redisClient.get(key);
        if (current && current > 0) {
          await redisClient.set(key, current - 1);
        }
      },
      async resetKey(key) {
        await redisClient.del(key);
      }
    } : undefined
  });
};

/**
 * General API rate limiter
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for registration
 */
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many accounts created from this IP, please try again after an hour.'
});

/**
 * Rate limiter for password reset
 */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again after an hour.'
});

/**
 * Rate limiter for creating orders
 */
export const orderLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute
  message: 'Too many orders created, please slow down.'
});

/**
 * Rate limiter for reports (more restrictive)
 */
export const reportLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 report requests per minute
  message: 'Too many report requests, please try again later.'
});

/**
 * Slow down middleware - gradually increase delay
 */
export const slowDown = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (hits) => hits * 100, // add 100ms delay per request after delayAfter
  maxDelayMs: 5000, // max 5 seconds delay
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * IP whitelist middleware
 */
export const ipWhitelist = (req, res, next) => {
  const whitelist = process.env.IP_WHITELIST 
    ? process.env.IP_WHITELIST.split(',')
    : [];

  if (whitelist.length === 0) {
    return next();
  }

  const clientIp = req.ip || req.connection.remoteAddress;

  if (whitelist.includes(clientIp)) {
    return next();
  }

  logger.warn(`Blocked request from non-whitelisted IP: ${clientIp}`);
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
};

export default {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  orderLimiter,
  reportLimiter,
  slowDown,
  ipWhitelist,
  createRateLimiter
};
