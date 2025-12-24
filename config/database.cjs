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

  const caValue = env === 'test' ? (process.env.DB_SSL_CA_TEST || process.env.DB_SSL_CA) : process.env.DB_SSL_CA;

  if (caValue) {
    try {
      if (caValue.includes('BEGIN CERTIFICATE')) {
        sslConfig.ca = caValue;
      } else {
        const caPath = path.resolve(process.cwd(), caValue);
        if (fs.existsSync(caPath)) {
          sslConfig.ca = fs.readFileSync(caPath, 'utf8');
        }
      }
    } catch (error) {
      console.warn('Warning: Could not load SSL CA certificate:', error.message);
    }
  }

  return sslConfig;
};


const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'elitehub',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: getSSLOptions('development') ? {
      ssl: getSSLOptions('development')
    } : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'elitehub_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: getSSLOptions('test') ? {
      ssl: getSSLOptions('test')
    } : {}
  },
  production: {
    username: 'daviduk',
    password: 'MyDatabase!23',
    database: 'elitehub',
    host: 'elitehubbydd.com',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: getSSLOptions('production') ? {
      ssl: getSSLOptions('production')
    } : {}
  }
};

const exportedConfig = {
  development: config.development,
  test: config.test,
  production: config.production,
  DEVELOPMENT: config.development,
  TESTING: config.test,
  PRODUCTION: config.production
};

// Use Proxy for the specified "any other value" fallback logic
module.exports = new Proxy(exportedConfig, {
  get: (target, prop) => {
    if (prop in target) return target[prop];
    return target.production;
  }
});
