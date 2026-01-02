# CORS Configuration Updated

## Changes Made

### CORS Configuration Updated to Allow All Origins

**File**: `middleware/security.js`

```javascript
export const corsConfig = cors({
  origin: "*", // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
});
```

**File**: `server.js`

Added CORS middleware import and usage:

```javascript
// Import security middleware for CORS
import { corsConfig } from "./middleware/security.js";

// CORS middleware enabled - allow all origins
app.use(corsConfig);
```

## CORS Configuration Details

The CORS configuration now allows:

- **Origin**: `*` (all origins allowed)
- **Credentials**: `true` (allows cookies/auth headers)
- **Methods**: All HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- **Headers**: Common headers including Content-Type, Authorization, Origin, X-Requested-With, Accept
- **Status**: 200 for successful OPTIONS requests

## Security Implications

⚠️ **Warning**: This configuration allows any website to make requests to your API from any origin. This removes all cross-origin restrictions.

## Testing

To verify CORS is working:

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Test from browser**:

   - Open browser console on any website
   - Run: `fetch('http://localhost:3000/api/health')`
   - Should work without CORS errors

3. **Test with curl**:

   ```bash
   curl -H "Origin: https://example.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3000/api
   ```

4. **Check response headers**:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type,Authorization,Origin,X-Requested-With,Accept`

## Previous Configuration

The previous configuration restricted origins to:

- http://localhost:3000
- http://localhost:5173
- https://elitehubdd-backend.onrender.com

This has been replaced with wildcard `*` to allow all origins as requested.
