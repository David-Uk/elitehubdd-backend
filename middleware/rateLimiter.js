import logger from '../config/logger.js';

// No-op middleware that just passes through
const noOp = (req, res, next) => next();

/**
 * All rate limiters are disabled - using no-op middleware
 */

/**
 * General API rate limiter (disabled)
 */
export const apiLimiter = noOp;

/**
 * Strict rate limiter for authentication endpoints (disabled)
 */
export const authLimiter = noOp;

/**
 * Rate limiter for registration (disabled)
 */
export const registerLimiter = noOp;

/**
 * Rate limiter for password reset (disabled)
 */
export const passwordResetLimiter = noOp;

/**
 * Rate limiter for creating orders (disabled)
 */
export const orderLimiter = noOp;

/**
 * Rate limiter for reports (disabled)
 */
export const reportLimiter = noOp;

/**
 * Rate limiter for guest operations (disabled)
 */
export const guestLimiter = noOp;

/**
 * Slow down middleware (disabled)
 */
export const slowDown = noOp;

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
  guestLimiter,
  slowDown,
  ipWhitelist
};
