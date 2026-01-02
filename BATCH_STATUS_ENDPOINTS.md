# Batch Order Status Management API

## Overview

Batch orders can transition through different status states to track their lifecycle from creation to completion or cancellation.

## Available Status Types

- **`pending`** - Batch created, waiting to be processed
- **`processing`** - Batch is being actively processed
- **`completed`** - Batch has been successfully completed
- **`cancelled`** - Batch was cancelled

## Endpoints

### 1. Update Batch Status

Updates the status of a specific batch order.

**Endpoint:** `PATCH /api/restaurant/batches/:id/status`

**Authentication:** Required
**Authorization:** `super_admin`, `admin`, `accountant`, `supervisor`

**Request Headers:**

```http
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Request Body:**

```json
{
  "status": "processing"
}
```

**Valid Status Values:**

- `pending`
- `processing`
- `completed`
- `cancelled`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Batch status updated successfully",
  "data": {
    "id": "uuid-here",
    "batchId": "BATCH-20250102-123456-789",
    "status": "processing",
    "staffId": "staff-uuid",
    "totalItems": 15,
    "totalAmount": "250.00",
    "tax": "12.50",
    "serviceCharge": "25.00",
    "notes": "Processing kitchen orders",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "completedAt": null,
    "staff": {
      "id": "staff-uuid",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "orders": [...],
    "sources": [...]
  }
}
```

**Error Responses:**

**Validation Error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "status",
      "message": "Invalid batch status. Must be one of: pending, processing, completed, cancelled",
      "value": "invalid_status"
    }
  ]
}
```

**Not Found (404):**

```json
{
  "success": false,
  "message": "Batch not found"
}
```

**Unauthorized (401/403):**

```json
{
  "success": false,
  "message": "Access token is required" or "Insufficient permissions"
}
```

### 2. Complete Batch

Marks a batch as completed and processes payments for all orders in the batch.

**Endpoint:** `POST /api/restaurant/batches/:id/complete`

**Authentication:** Required
**Authorization:** `super_admin`, `admin`, `accountant`, `supervisor`

**Request Body:**

```json
{
  "paymentMethod": "cash"
}
```

**Valid Payment Methods:**

- `cash`
- `card`
- `room_charge`
- `mobile_money`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Batch completed successfully",
  "data": {
    "id": "uuid-here",
    "status": "completed",
    "completedAt": "2024-01-15T12:30:00.000Z",
    ...
  }
}
```

### 3. Cancel Batch

Cancels a batch and removes batch assignment from all orders.

**Endpoint:** `POST /api/restaurant/batches/:id/cancel`

**Authentication:** Required
**Authorization:** `super_admin`, `admin`, `accountant`, `supervisor`

**Request Body:**

```json
{
  "reason": "Kitchen equipment failure"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Batch cancelled successfully",
  "data": {
    "id": "uuid-here",
    "status": "cancelled",
    "notes": "Kitchen equipment failure",
    ...
  }
}
```

## Status Flow Examples

### Typical Workflow

1. **Create Batch** → Status: `pending`
2. **Start Processing** → `PATCH /batches/:id/status` with `{"status": "processing"}`
3. **Complete Batch** → `POST /batches/:id/complete` with payment method
4. **Status becomes** → `completed`

### Cancellation Workflow

1. **Create Batch** → Status: `pending`
2. **Cancel Batch** → `POST /batches/:id/cancel` with reason
3. **Status becomes** → `cancelled`

## Usage Examples with curl

### Update Status to Processing

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"status": "processing"}'
```

### Update Status to Completed

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"status": "completed"}'
```

### Complete Batch with Payment

```bash
curl -X POST "http://localhost:3000/api/restaurant/batches/batch-uuid-here/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"paymentMethod": "cash"}'
```

### Cancel Batch

```bash
curl -X POST "http://localhost:3000/api/restaurant/batches/batch-uuid-here/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"reason": "Customer cancelled order"}'
```

## Notes

- When status is changed to `completed`, the `completedAt` timestamp is automatically set
- When a batch is cancelled, all orders in the batch have their `batchId` set to `null`
- Cache is automatically invalidated when batch status changes to ensure data consistency
- All status changes are logged for audit purposes
