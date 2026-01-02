import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import logger from './config/logger.js';
import redisClient from './config/redis.js';
import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Debug from 'debug';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debug = Debug('backend:server');

// Security middleware removed
import { activityLogger } from './middleware/activityLogger.js';

// Rate limiters removed

// Import routes
import authRoutes from './routes/authRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import roomTypeRoutes from './routes/roomTypeRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import barRoutes from './routes/barRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Socket.io service removed

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy removed

// Security middleware removed

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization removed
app.use(activityLogger);

// HTTP request logging with Morgan and Winston
// Morgan logs all API requests with timestamp, method, URL, status, and response time
const morganFormat = ':method :url | Status: :status | Duration: :response-time ms | IP: :remote-addr';

  const winstonStream = {
    write: (message) => {
      if (message && message.trim()) {
        // Log to console
        console.log(`🔍 ${message.trim()}`);
        // Log to Winston HTTP logger for file persistence
        logger.http(message.trim());
      }
    }
  };

// Apply Morgan middleware with custom stream
app.use(morgan(morganFormat, { 
  stream: winstonStream,
  skip: (req) => {
    // Don't log health checks
    return req.path === '/health';
  }
}));

// Rate limiting removed

// Apply activity logger to log all API calls
app.use('/api/', activityLogger);

// Static files with basic configuration
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes - serve React app for non-API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to EliteHub Hotel Management API',
    version: '2.0.0',
    status: 'running',
    features: {
      caching: redisClient.isConnected ? 'enabled' : 'disabled',
      security: 'disabled',
      logging: 'enabled',
      rateLimiting: 'disabled',
      compression: 'enabled'
    },
    endpoints: {
      reservations: '/api/reservations',
      rooms: '/api/rooms',
      roomTypes: '/api/room-types',
      reports: '/api/reports',
      auth: '/api/auth',
      restaurant: '/api/restaurant',
      bar: '/api/bar',
      uploads: '/api/uploads',
      inventory: '/api/inventory',
      departments: '/api/departments',
      users: '/api/users',
      guests: '/api/guests',
      notifications: '/api/notifications',
      dashboard: '/api/dashboard',
      health: '/health',
      metrics: '/metrics'
    }
  });
});

// API Routes
// API Routes
// Public/Open Network Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/reports', reportRoutes);

// Private Network restricted Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/bar', barRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Swagger Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check route
app.get('/health', async (req, res) => {
  try {
    const db = (await import('./models/index.js')).default;
    await db.sequelize.authenticate();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'connected',
        redis: redisClient.isConnected ? 'connected' : 'disconnected'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        redis: {
          connected: redisClient.isConnected
        }
      }
    });
  } catch (error) {
    logger.error(`Metrics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics'
    });
  }
});

// Serve React app for all non-API routes (must be after all API routes)
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
    return next();
  }
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connection
    try {
      const db = (await import('./models/index.js')).default;
      await db.sequelize.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error(`Error closing database: ${error.message}`);
    }
    
    // Close Redis connection
    try {
      await redisClient.disconnect();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error(`Error closing Redis: ${error.message}`);
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start server
let server;
const startServer = async () => {
  debug('Initializing server startup sequence...');
  try {
    // Connect to database
    await connectDB();
    
    // Connect to Redis (optional - app works without it)
    try {
      await redisClient.connect();
    } catch (error) {
        console.log(error.message)
      logger.warn('Redis connection failed - caching disabled');
    }
    
    // Start listening
    // Start listening
    server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏨 EliteHub Hotel Management System v2.0`);
      
      // Socket.io disabled

      logger.info(`📡 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`🔒 Security: Disabled`);
      logger.info(`📊 Logging: Enabled`);
      logger.info(`⚡ Caching: ${redisClient.isConnected ? 'Enabled' : 'Disabled'}`);
      logger.info(`🛡️  Rate Limiting: Disabled`);
      logger.info(`🗜️  Compression: Enabled`);
      logger.info('='.repeat(50));
    });

    // HTTP Keep-Alive settings
    server.keepAliveTimeout = 65000; // Ensure it's slightly higher than load balancer timeout (e.g. AWS ALB is 60s)
    server.headersTimeout = 66000; // Must be higher than keepAliveTimeout
    
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;





