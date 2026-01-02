import helmet from 'helmet';


import hpp from 'hpp';
import cors from 'cors';

/**
 * Configure Helmet for security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "blob:", "https://www.google-analytics.com"], // Allow Google Analytics
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "blob:"], // Allow data URIs and blobs
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://overbridgenet.com"], // Allow external connections
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true, // Enable proper MIME type detection
  xssFilter: true,
  referrerPolicy: {
    policy: 'same-origin'
  }
});

/**
 * Configure CORS
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000', 
          'http://localhost:5173',
          'https://elitehubdd-backend.onrender.com',
          'https://elitehubdd-backend.onrender.com/',
          'https://elitehubdd-backend.onrender.com/assets'
        ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

/**
 * Data sanitization and security middleware for Express 5
 * Express 5 makes req.query a getter, so we must mutate objects in-place.
 */
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/\0/g, '') // Remove null bytes
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // Remove script tags
      .replace(/on\w+="[^"]*"/gim, "") // Remove inline handlers
      .replace(/on\w+='[^']*'/gim, "")
      .replace(/javascript:[^"']*/gim, ""); // Remove javascript: protocol
  }
  return val;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  Object.keys(obj).forEach(key => {
    // 1. Prevent NoSQL Injection (remove keys starting with $)
    if (key.startsWith('$')) {
      delete obj[key];
      return;
    }

    const value = obj[key];

    // 2. Prevent XSS by cleaning strings
    if (typeof value === 'string') {
      obj[key] = sanitizeValue(value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          value[index] = sanitizeValue(item);
        } else if (typeof item === 'object' && item !== null) {
          sanitizeObject(item);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  });
};

/**
 * Combined Data sanitization against NoSQL injection and XSS
 */
export const sanitizeData = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

/**
 * Dummy middleware to maintain compatibility with existing code
 */
export const preventXSS = (req, res, next) => next();

/**
 * Prevent HTTP Parameter Pollution
 */
export const preventHPP = hpp({
  whitelist: [
    'status',
    'category',
    'orderType',
    'role',
    'isAvailable'
  ]
});

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimiter = {
  json: { limit: '10mb' },
  urlencoded: { extended: true, limit: '10mb' }
};

/**
 * Restrict access to private network only
 */
export const requirePrivateNetwork = (req, res, next) => {
  // Get client IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Handle comma-separated IPs in x-forwarded-for
  if (ip && ip.indexOf(',') > -1) {
    ip = ip.split(',')[0].trim();
  }

  // Normalize IPv6 localhost to IPv4
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  
  // Strip IPv6 prefix if present (::ffff:)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Private IP ranges regex
  // 127.0.0.0 - 127.255.255.255 (Localhost)
  // 10.0.0.0 - 10.255.255.255 (Class A)
  // 172.16.0.0 - 172.31.255.255 (Class B)
  // 192.168.0.0 - 192.168.255.255 (Class C)
  const isPrivate = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip);

  // Allow localhost, private IPs, or specified trusted IPs from env
  const trustedIPs = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];
  
  if (isPrivate || trustedIPs.includes(ip)) {
    next();
  } else {
    // Check if path is excluded (reservations and reports are public as per request)
    // Actually, we will apply this middleware selectively in server.js instead of hardcoding paths here
    // But if applied globally, we would check paths here.
    // The user said "All API endpoints except...". 
    // It is safer to make this a strict middleware and apply it conditionally in server.js
    
    // Log the blocked attempt
    // console.log(`Blocked access from public IP: ${ip} to ${req.originalUrl}`);
    res.status(403).json({
      success: false,
      message: 'Access denied: Private network only'
    });
  }
};
