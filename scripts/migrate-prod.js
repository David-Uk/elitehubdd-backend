#!/usr/bin/env node

/**
 * Production Migration Runner
 * 
 * This script ensures migrations run in production environment
 * Usage: node scripts/migrate-prod.js [migration-name]
 */

import { execSync } from 'child_process';

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Running migration in PRODUCTION environment...');
console.log('📍 Database:', process.env.DB_NAME || 'elitehub');
console.log('🌐 Host:', process.env.DB_HOST || 'elitehubbydd.com');
console.log('');

try {
  // Get migration name from command line arguments
  const migrationName = process.argv[2];
  
  if (migrationName) {
    console.log(`📋 Running specific migration: ${migrationName}`);
    execSync(`npx sequelize-cli db:migrate --name ${migrationName}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } else {
    console.log('📋 Running all pending migrations...');
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }
  
  console.log('');
  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('');
  console.error('❌ Migration failed!');
  console.error('Error:', error.message);
  process.exit(1);
}
