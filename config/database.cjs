const fs = require('fs');
const path = require('path');
require('dotenv').config();

const getSSLOptions = (env) => {
  let isEnabled = false;
  
  if (env === 'test') {
    isEnabled = process.env.DB_SSL_TEST === 'true' || process.env.DB_SSL === 'true';
  } else if (env === 'production') {
    isEnabled = process.env.DB_SSL === 'true';
  } else if (env === 'development') {
    isEnabled = process.env.DB_SSL_DEV === 'true';
  }

  if (!isEnabled) return false;
  
  const sslConfig = {
    require: true,
    rejectUnauthorized: true,
  };

  // Use the ca.pem certificate file for SSL connections
  const caPath = path.resolve(process.cwd(), 'ca.pem');
  if (fs.existsSync(caPath)) {
    try {
      sslConfig.ca = fs.readFileSync(caPath, 'utf8');
      console.log(`✅ Loaded SSL certificate from: ${caPath}`);
    } catch (error) {
      console.warn('Warning: Could not load SSL CA certificate:', error.message);
    }
  } else {
    console.warn('Warning: SSL certificate file not found at:', caPath);
  }

  return sslConfig;
};

// Parse database URL for test environment
const parseDatabaseUrl = (url) => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    return {
      username: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.substring(1), // Remove leading slash
      host: urlObj.hostname,
      port: urlObj.port || 5432,
      dialect: 'postgres',
      ssl: urlObj.searchParams.has('sslmode') && urlObj.searchParams.get('sslmode') === 'require'
    };
  } catch (error) {
    console.error('Error parsing database URL:', error.message);
    return null;
  }
};

const config = {
  // Force use of test database for all environments
  test: {
    // Use the provided testing database URL
    ...parseDatabaseUrl(process.env.DATABASE_URL_TEST || "postgres://avnadmin:AVNS_quFP85rULsRZeLJySVe@pg-f1b26ef-elitehub.f.aivencloud.com:13905/defaultdb?sslmode=require"),
    logging: false,
    dialectOptions: {
      ssl: getSSLOptions('test')
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

const exportedConfig = {
  ...config,
  DEVELOPMENT: config.test,
  TESTING: config.test,
  PRODUCTION: config.test
};

// Use Proxy for the specified "any other value" fallback logic
module.exports = new Proxy(exportedConfig, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return target.test; // Default to test database instead of production
  }
});
