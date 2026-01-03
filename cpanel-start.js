#!/usr/bin/env node

// cPanel startup script with memory optimizations
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables for cPanel memory constraints
process.env.NODE_OPTIONS = [
  '--max-old-space-size=512',
  '--optimize-for-size',
  '--max-semi-space-size=64',
  '--no-liftoff'
].join(' ');

// Additional memory optimizations
process.env.UV_THREADPOOL_SIZE = '4'; // Reduce thread pool size
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('Starting EliteHub with cPanel memory optimizations...');
console.log(`NODE_OPTIONS: ${process.env.NODE_OPTIONS}`);

// Start the server
const serverProcess = spawn('node', [
  '--max-old-space-size=512',
  '--max-new-space-size=128',
  '--optimize-for-size',
  '--max-semi-space-size=64',
  '--no-liftoff',
  'server.js'
], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS
  }
});

// Handle process events
serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server exited with code: ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});
