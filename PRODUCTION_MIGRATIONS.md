# Production Database Migration Guide

## Overview

This guide explains how to run database migrations on the production and testing databases for EliteHub.

## 🚨 Important Change: Testing Database is Now Default

**The application now uses the testing database as the default** to prevent connection timeout issues with the production database.

## Database Configurations

### Testing Database (Default) 🎯

- **URL**: `postgres://avnadmin:AVNS_quFP85rULsRZeLJySVe@pg-f1b26ef-elitehub.f.aivencloud.com:13905/defaultdb?sslmode=require`
- **Host**: `pg-f1b26ef-elitehub.f.aivencloud.com`
- **Port**: `13905`
- **Database**: `defaultdb`
- **User**: `avnadmin`
- **SSL**: Required (uses `ca.pem` certificate)

### Production Database

- **Host**: `elitehubbydd.com:5432`
- **Database**: `elitehub`
- **User**: `daviduk`
- **SSL**: Configurable via `DB_SSL` environment variable

## SSL Certificate Configuration

The system uses the `ca.pem` certificate file for SSL connections to the testing database. The certificate is automatically loaded when `DB_SSL=true`.

### Environment Variables for Testing

```bash
NODE_ENV=test
DATABASE_URL_TEST="postgres://avnadmin:AVNS_quFP85rULsRZeLJySVe@pg-f1b26ef-elitehub.f.aivencloud.com:13905/defaultdb?sslmode=require"
DB_SSL=true
```

## Migration Commands

### Production Migrations

```bash
# Run all pending migrations on production
npm run db:migrate:prod

# Run specific migration on production
npm run migrate:prod -- 20241230000000-add-guest-notes

# Undo last migration on production
npm run db:migrate:prod:undo

# Reset production database ( DANGER!)
npm run db:reset:prod
```

### Testing Migrations

```bash
# Run all pending migrations on testing database
npm run db:migrate:test

# Run specific migration on testing database
npm run migrate:test -- 20241230000000-add-guest-notes

# Using cross-env directly
cross-env NODE_ENV=test sequelize-cli db:migrate

# Undo last migration on testing database
npm run db:migrate:test:undo

# Reset testing database
npm run db:reset:test
```

## Current Pending Migration

### Guest Notes Migration

- **File**: `20241230000000-add-guest-notes.cjs`
- **Purpose**: Adds `notes` column to the `guests` table
- **Type**: TEXT, nullable
- **Safe**: Can be run multiple times

### To Run Guest Notes Migration

**On Testing Database:**

```bash
npm run migrate:test -- 20241230000000-add-guest-notes
# OR
npm run db:migrate:test
```

**On Production Database:**

```bash
npm run migrate:prod -- 20241230000000-add-guest-notes
# OR
npm run db:migrate:prod
```

## SSL Certificate Setup

The `ca.pem` file should be located in the project root. The system automatically:

1.  Checks if `DB_SSL=true` (or `DB_SSL_TEST=true`)
2.  Loads `ca.pem` certificate file
3.  Configures SSL options for database connection
4.  Provides console feedback about certificate loading

### Certificate Loading Process

```javascript
// The system automatically loads the certificate when SSL is enabled
const caPath = path.resolve(process.cwd(), "ca.pem");
if (fs.existsSync(caPath)) {
  sslConfig.ca = fs.readFileSync(caPath, "utf8");
  console.log(" Loaded SSL certificate from: ca.pem");
}
```

## Migration Status Check

```bash
# Check production migration status
cross-env NODE_ENV=production sequelize-cli db:migrate:status

# Check testing migration status
cross-env NODE_ENV=test sequelize-cli db:migrate:status
```

## Troubleshooting

### SSL Certificate Issues

- **Error**: "SSL certificate file not found"
- **Solution**: Ensure `ca.pem` exists in project root
- **Check**: `ls -la ca.pem`

### Database Connection Issues

- **Testing Database**: Check Aiven Cloud connectivity
- **Production Database**: Verify elitehubbydd.com accessibility
- **Credentials**: Verify database credentials are correct

### Migration Already Exists

If you get an error that the column already exists, the migration has been run successfully. The migration includes error handling for this case.

## Environment Setup

### For Testing Database

```bash
# Set environment variables
export NODE_ENV=test
export DATABASE_URL_TEST="postgres://avnadmin:AVNS_quFP85rULsRZeLJySVe@pg-f1b26ef-elitehub.f.aivencloud.com:13905/defaultdb?sslmode=require"
export DB_SSL=true

# Run migration
npm run migrate:test
```

### For Production Database

```bash
# Set environment variables
export NODE_ENV=production
export DB_SSL=true  # Optional: enable SSL for production

# Run migration
npm run migrate:prod
```

## Best Practices

1.  **Test First**: Always test migrations on the testing database first
2.  **SSL Verification**: Ensure SSL certificate is properly configured
3.  **Backup Production**: Create backups before production migrations
4.  **Monitor Logs**: Watch migration output for errors
5.  **Environment Isolation**: Use appropriate NODE_ENV for each environment

## Migration Script Features

### Production Script (`scripts/migrate-prod.js`)

- Forces production environment
- Shows database connection info
- Clear error messages
- Support for specific migrations

### Testing Script (`scripts/migrate-test.js`)

- Forces testing environment
- Shows SSL certificate status
- Aiven Cloud connection info
- Detailed troubleshooting tips
- SSL verification feedback

## Example Workflow

```bash
# 1. Test migration on testing database
npm run migrate:test -- 20241230000000-add-guest-notes

# 2. Verify migration worked
cross-env NODE_ENV=test sequelize-cli db:migrate:status

# 3. Run on production (after testing succeeds)
npm run migrate:prod -- 20241230000000-add-guest-notes

# 4. Verify production migration
cross-env NODE_ENV=production sequelize-cli db:migrate:status
```

## Emergency Procedures

### If Migration Fails on Testing Database

```bash
# Undo the failed migration
npm run db:migrate:test:undo

# Check SSL certificate
ls -la ca.pem

# Verify database connectivity
psql "$DATABASE_URL_TEST"
```

### If Migration Fails on Production Database

```bash
# Immediately undo the last migration
npm run db:migrate:prod:undo

# Contact database administrator
# Restore from backup if needed
```

## Database URL Parsing

The system automatically parses the database URL to extract connection details:

```javascript
// From: postgres://user:pass@host:port/db?sslmode=require
// Extracts: username, password, database, host, port, ssl requirements
```

This ensures consistent configuration across environments while maintaining security.
