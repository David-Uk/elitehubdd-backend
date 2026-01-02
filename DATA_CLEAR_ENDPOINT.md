# Data Clearing Endpoint Documentation

## Overview

Created a secure endpoint to clear all data from the database while preserving User and Staff models.

## Endpoints

### 1. Get Data Summary (Preview)

- **URL**: `GET /api/data-clear/summary`
- **Authentication**: Required (JWT token)
- **Authorization**: Admin or Super Admin roles
- **Purpose**: Preview what data will be cleared before executing

**Response Example**:

```json
{
  "success": true,
  "message": "Data summary retrieved",
  "preservedModels": ["User", "Staff"],
  "modelsToClear": ["Reservation", "Room", "BarOrder", "RestaurantOrder", ...],
  "summary": {
    "User": { "count": 5, "willBeCleared": false },
    "Staff": { "count": 12, "willBeCleared": false },
    "Reservation": { "count": 150, "willBeCleared": true },
    "Room": { "count": 25, "willBeCleared": true }
  }
}
```

### 2. Clear All Data

- **URL**: `DELETE /api/data-clear/clear-all`
- **Authentication**: Required (JWT token)
- **Authorization**: Super Admin role ONLY
- **Purpose**: Execute the data clearing operation

**Response Example**:

```json
{
  "success": true,
  "message": "Data clearing operation completed",
  "summary": {
    "totalModelsProcessed": 18,
    "successfulClears": 18,
    "failedClears": 0,
    "preservedModels": ["User", "Staff"],
    "preservedDataCounts": {
      "User": 5,
      "Staff": 12
    }
  },
  "details": [
    {
      "model": "Reservation",
      "recordsDeleted": 150,
      "status": "success"
    }
  ]
}
```

## Security Features

### Authentication & Authorization

- **JWT Authentication**: All endpoints require valid JWT token
- **Role-Based Access**:
  - Summary endpoint: Admin or Super Admin
  - Clear endpoint: Super Admin ONLY
- **Account Status Check**: Blocks disabled/suspended accounts

### Data Protection

- **Transaction Safety**: All operations wrapped in database transactions
- **Rollback on Error**: Automatic rollback if any operation fails
- **Preserved Models**: User and Staff data is NEVER deleted
- **Force Delete**: Uses `force: true` to bypass soft deletes

## Models Preserved

The following models are NEVER cleared:

- **User**: Contains user accounts and authentication data
- **Staff**: Contains staff information including admin and super admin accounts

## Models Cleared

All other models will be cleared, including but not limited to:

- Reservation
- Room
- RoomType
- BarOrder
- BarOrderItem
- RestaurantOrder
- RestaurantOrderItem
- Guest
- InventoryItem
- InventoryStock
- MenuItem
- Department
- Notification
- Feedback
- And more...

## Usage Instructions

### Step 1: Get Summary (Recommended)

```bash
# Get authentication token first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Use token to get summary
curl -X GET http://localhost:3000/api/data-clear/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 2: Clear Data (Super Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/data-clear/clear-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Safety Considerations

⚠️ **WARNING**: This is a destructive operation that cannot be undone.

1. **Backup First**: Always backup your database before clearing
2. **Preview First**: Use the summary endpoint to see what will be cleared
3. **Super Admin Only**: Only super admin accounts can execute clearing
4. **Test Environment**: Test thoroughly in development environment first

## Error Handling

The endpoint provides detailed error information:

- **Authentication errors**: Invalid/missing tokens
- **Authorization errors**: Insufficient permissions
- **Database errors**: Transaction failures with automatic rollback
- **Model-specific errors**: Individual model clearing failures

## Logging

All operations are logged with:

- Which models were processed
- Number of records deleted per model
- Any errors encountered
- Transaction status
- User who initiated the operation

## Files Created/Modified

1. **controllers/dataClearController.js**: Main logic for data clearing
2. **routes/dataClearRoutes.js**: Route definitions
3. **middleware/auth.js**: Added missing auth functions
4. **server.js**: Added data clearing routes

## Testing

Use the provided test scripts to verify functionality:

- Test authentication and authorization
- Test summary endpoint
- Test clearing endpoint (with caution)
- Verify preserved data remains intact
