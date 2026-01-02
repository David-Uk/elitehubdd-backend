#!/usr/bin/env node

/**
 * Database Configuration Checker
 * 
 * This script shows which database configuration will be used
 */

import config from '../config/database.js';

console.log('🔍 Database Configuration Check');
console.log('================================');

console.log('📊 Current Environment:', process.env.NODE_ENV || 'undefined');
console.log('🔒 SSL Enabled:', process.env.DB_SSL === 'true' ? 'Yes' : 'No');
console.log('');

// Get the actual config that will be used
const dbConfig = config[process.env.NODE_ENV] || config;

console.log('🗄️ Database Configuration:');
console.log('------------------------');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('Username:', dbConfig.username);
console.log('Dialect:', dbConfig.dialect);
console.log('Logging:', dbConfig.logging ? 'Enabled' : 'Disabled');

if (dbConfig.dialectOptions?.ssl) {
  console.log('SSL:', 'Configured');
  if (dbConfig.dialectOptions.ssl.ca) {
    console.log('SSL Certificate:', 'Loaded');
  }
} else {
  console.log('SSL:', 'Not configured');
}

console.log('');
console.log('📋 Available Commands:');
console.log('----------------------');
console.log('npm start              # Start with testing database (default)');
console.log('npm run start:prod     # Start with production database');
console.log('npm run dev            # Start with development database');
console.log('npm run dev:test       # Start with testing database (watch mode)');
console.log('');
console.log('🗃️ Migration Commands:');
console.log('----------------------');
console.log('npm run db:migrate     # Migrate testing database');
console.log('npm run db:migrate:prod # Migrate production database');
console.log('npm run db:reset       # Reset testing database');
console.log('npm run db:reset:prod  # Reset production database');
