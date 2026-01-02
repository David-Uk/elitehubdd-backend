#!/usr/bin/env node

/**
 * Testing Migration Runner
 * 
 * This script ensures migrations run in testing environment with SSL
 * Usage: node scripts/migrate-test.js [migration-name]
 */

import { execSync } from 'child_process';

// Set testing environment
process.env.NODE_ENV = 'test';

console.log('🧪 Running migration in TESTING environment...');
console.log('📍 Database:', process.env.DATABASE_URL_TEST ? 'Aiven Cloud PostgreSQL' : 'Local Test Database');
console.log('🔒 SSL:', process.env.DB_SSL === 'true' ? 'Enabled' : 'Disabled');
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
  console.error('');
  console.error('💡 Troubleshooting tips:');
  console.error('   - Check if DATABASE_URL_TEST is correct');
  console.error('   - Verify ca.pem certificate file exists');
  console.error('   - Ensure DB_SSL=true for SSL connections');
  console.error('   - Check network connectivity to Aiven Cloud');
  process.exit(1);
}
