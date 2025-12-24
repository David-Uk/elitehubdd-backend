const fs = require('fs');
const content = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Database@91
DB_NAME=elitehub
DB_NAME_TEST=elitehub_test

# Application
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret_here_change_this_in_production
JWT_EXPIRE=30d

# Testing Database Configuration
DATABASE_URL_TEST="postgres://avnadmin:AVNS_quFP85rULsRZeLJySVe@pg-f1b26ef-elitehub.f.aivencloud.com:13905/defaultdb?sslmode=require"

# SSL Configuration
DB_SSL=false
DB_SSL_CA=ca.pem

# Redis Configuration
REDIS_URL=redis://default:M4n51tZDCljrd1LtkywWJ6kOMnF6zGOk@redis-12470.c323.us-east-1-2.ec2.redns.redis-cloud.com:12470

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=drctzzzlg
CLOUDINARY_API_KEY=939947456232986
CLOUDINARY_API_SECRET=rjFa63d-huqFom_tSEm1JeffbEI

# Logging
LOG_LEVEL=info
`;
fs.writeFileSync('.env', content);
console.log('.env file has been cleanly rewritten.');
