// Security middleware - All configurations removed
// This file is kept as placeholder but all security features have been disabled

/**
 * Empty helmet configuration - security disabled
 */
export const helmetConfig = (req, res, next) => next();

/**
 * Empty CORS configuration - security disabled
 */
export const corsConfig = (req, res, next) => next();

/**
 * Empty data sanitization - security disabled
 */
export const sanitizeData = (req, res, next) => next();

/**
 * Empty XSS prevention - security disabled
 */
export const preventXSS = (req, res, next) => next();

/**
 * Empty HPP prevention - security disabled
 */
export const preventHPP = (req, res, next) => next();

/**
 * Empty security headers - security disabled
 */
export const securityHeaders = (req, res, next) => next();

/**
 * Empty private network requirement - security disabled
 */
export const requirePrivateNetwork = (req, res, next) => next();
