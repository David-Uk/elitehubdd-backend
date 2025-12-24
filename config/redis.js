import Redis from 'ioredis';
import logger from './logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      let redisConfig;
      
      if (process.env.REDIS_URL) {
        redisConfig = process.env.REDIS_URL;
      } else {
        redisConfig = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB) || 0,
        };
      }
      

      const commonOptions = {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true
      };

      this.client = typeof redisConfig === 'string' 
        ? new Redis(redisConfig, commonOptions)
        : new Redis({ ...redisConfig, ...commonOptions });

      // Event listeners
      this.client.on('connect', () => {
        logger.info('✅ Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis client ready');
      });

      this.client.on('error', (err) => {
        logger.error(`❌ Redis client error: ${err.message}`);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('⚠️ Redis client connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('🔄 Redis client reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();

      return this.client;
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      // Don't throw error - app should work without Redis
      this.isConnected = false;
      return null;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Redis DEL pattern error: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error: ${error.message}`);
      return false;
    }
  }

  /**
   * Set expiration on key
   */
  async expire(key, ttl) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error: ${error.message}`);
      return false;
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    if (!this.isConnected) return null;
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error: ${error.message}`);
      return null;
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.flushall();
      logger.warn('⚠️ Redis cache flushed');
      return true;
    } catch (error) {
      logger.error(`Redis FLUSHALL error: ${error.message}`);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis client disconnected');
    }
  }

  /**
   * Get Redis client instance
   */
  getClient() {
    return this.client;
  }
}

// Create singleton instance
const redisClient = new RedisClient();

export default redisClient;
