// Test script to verify database configuration
import db from './config/database.js';

console.log('Database configuration loaded:');
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('Test config:', db.test);
console.log('All environments now use test database');
