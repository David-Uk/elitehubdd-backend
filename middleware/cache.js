import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Cache middleware factory
 */
export const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if Redis is not connected
    if (!redisClient.isConnected) {
      return next();
    }

    try {
      // Generate cache key from URL and query params
      const key = `cache:${req.originalUrl || req.url}`;

      // Check if data exists in cache
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug(`Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      logger.debug(`Cache MISS: ${key}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        redisClient.set(key, data, duration).catch(err => {
          logger.error(`Cache SET error: ${err.message}`);
        });

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error.message}`);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    if (!redisClient.isConnected) {
      return next();
    }

    try {
      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to invalidate cache after successful response
      res.json = async (data) => {
        // Only invalidate on successful responses
        if (data.success !== false && res.statusCode < 400) {
          for (const pattern of patterns) {
            await redisClient.delPattern(`cache:${pattern}`);
            logger.debug(`Cache invalidated: ${pattern}`);
          }
        }

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`Cache invalidation error: ${error.message}`);
      next();
    }
  };
};

/**
 * Cache with user-specific key
 */
export const cacheWithUser = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !redisClient.isConnected) {
      return next();
    }

    try {
      const userId = req.user?.id || 'anonymous';
      const key = `cache:user:${userId}:${req.originalUrl || req.url}`;

      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug(`User cache HIT: ${key}`);
        return res.json(cachedData);
      }

      logger.debug(`User cache MISS: ${key}`);

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        redisClient.set(key, data, duration).catch(err => {
          logger.error(`User cache SET error: ${err.message}`);
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`User cache middleware error: ${error.message}`);
      next();
    }
  };
};

/**
 * Clear all cache
 */
export const clearAllCache = async (req, res) => {
  try {
    await redisClient.delPattern('cache:*');
    logger.info('All cache cleared');
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    logger.error(`Clear cache error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
};

/**
 * Clear specific cache pattern
 */
export const clearCachePattern = (pattern) => {
  return async (req, res) => {
    try {
      await redisClient.delPattern(`cache:${pattern}`);
      logger.info(`Cache cleared for pattern: ${pattern}`);
      res.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
      });
    } catch (error) {
      logger.error(`Clear cache pattern error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  };
};

/**
 * Cache statistics
 */
export const getCacheStats = async (req, res) => {
  try {
    if (!redisClient.isConnected) {
      return res.json({
        success: true,
        data: {
          connected: false,
          message: 'Redis not connected'
        }
      });
    }

    const client = redisClient.getClient();
    const info = await client.info('stats');
    const dbSize = await client.dbsize();

    res.json({
      success: true,
      data: {
        connected: true,
        dbSize,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error(`Get cache stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics'
    });
  }
};

export default {
  cache,
  invalidateCache,
  cacheWithUser,
  clearAllCache,
  clearCachePattern,
  getCacheStats
};
