# Batch Order Edit API

## Overview

Batch orders can be modified after creation to adjust quantities, add new items, or remove items from existing batches. This provides flexibility for kitchen operations and order management.

## Endpoint

### Edit Batch Order Items

**Endpoint:** `PATCH /api/restaurant/batches/:id/edit`

**Authentication:** Required
**Authorization:** `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter`

**Request Headers:**

```http
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## Request Body

The endpoint accepts different actions based on the operation you want to perform:

### 1. Increase Item Quantity

Add more quantity to an existing menu item in the batch.

```json
{
  "action": "increase",
  "menuItemId": "uuid-of-menu-item",
  "quantity": 5,
  "reason": "Customer requested additional items"
}
```

### 2. Reduce Item Quantity

Reduce quantity of an existing menu item in the batch.

```json
{
  "action": "reduce",
  "menuItemId": "uuid-of-menu-item",
  "quantity": 2,
  "reason": "Overestimated demand"
}
```

### 3. Remove Item Completely

Remove a menu item entirely from the batch.

```json
{
  "action": "remove",
  "menuItemId": "uuid-of-menu-item",
  "quantity": 0,
  "reason": "Item out of stock"
}
```

### 4. Add New Menu Item

Add a completely new menu item that doesn't exist in the batch.

```json
{
  "action": "add",
  "menuItemId": "uuid-of-new-menu-item",
  "quantity": 3,
  "reason": "Customer requested additional dish"
}
```

## Request Parameters

| Parameter    | Type    | Required | Description                                                 |
| ------------ | ------- | -------- | ----------------------------------------------------------- |
| `action`     | String  | ✅       | Operation to perform: `increase`, `reduce`, `remove`, `add` |
| `menuItemId` | UUID    | ✅       | ID of the menu item to modify                               |
| `quantity`   | Integer | ✅       | Quantity to add, reduce, or 0 for remove                    |
| `reason`     | String  | ✅       | Reason for the modification (3-200 characters)              |

## Response Examples

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Batch order updated successfully",
  "data": {
    "id": "batch-uuid",
    "batchId": "BATCH-20250102-123456-789",
    "status": "pending",
    "totalItems": 25,
    "totalAmount": "450.00",
    "tax": "22.50",
    "serviceCharge": "45.00",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z",
    "staff": {
      "id": "staff-uuid",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "orders": [
      {
        "id": "order-uuid",
        "orderNumber": "RO202501021234",
        "status": "pending",
        "items": [
          {
            "id": "item-uuid",
            "menuItemId": "menu-item-uuid",
            "quantity": 8,
            "unitPrice": "18.00",
            "totalPrice": "144.00",
            "specialInstructions": "Increased: Customer requested additional items (2024-01-15T11:15:00.000Z)",
            "menuItem": {
              "id": "menu-item-uuid",
              "name": "Grilled Salmon",
              "price": "18.00"
            }
          }
        ]
      }
    ],
    "sources": [...]
  }
}
```

### Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "action",
      "message": "Action must be one of: increase, reduce, remove",
      "value": "invalid_action"
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

**Business Logic Error (400):**

```json
{
  "success": false,
  "message": "Cannot edit completed or cancelled batches"
}
```

**Menu Item Not Found (400):**

```json
{
  "success": false,
  "message": "Menu item not found in this batch"
}
```

**Item Unavailable (400):**

```json
{
  "success": false,
  "message": "Menu item Grilled Salmon is not available"
}
```

**Invalid Quantity (400):**

```json
{
  "success": false,
  "message": "Cannot reduce quantity below 1. Use remove action instead."
}
```

**Item Already Exists (400):**

```json
{
  "success": false,
  "message": "Menu item Grilled Salmon already exists in batch. Use 'increase' action instead."
}
```

## Business Logic

### Batch Status Restrictions

- **Cannot edit** batches with status `completed` or `cancelled`
- **Can edit** batches with status `pending` or `processing`

### Action Behaviors

#### Increase Action

- If menu item exists in batch: Increases quantity and updates total price
- If menu item doesn't exist: Creates new order with the item
- Updates special instructions with increase reason and timestamp

#### Reduce Action

- Finds existing menu item in batch
- Validates new quantity won't go below 1
- Updates quantity and total price
- Adds reduction reason to special instructions

#### Remove Action

- Removes the order item completely
- If order has no remaining items: Removes entire order
- If order has other items: Updates order totals

#### Add Action

- Validates that the menu item doesn't already exist in the batch
- Creates a completely new order with the specified menu item
- Sets up proper pricing and special instructions
- Adds audit trail for new item addition

### Automatic Calculations

- **Order Totals**: Recalculated after each modification
- **Batch Totals**: Recalculated after each modification
- **Tax**: 5% of subtotal
- **Service Charge**: 10% of subtotal
- **Total Amount**: Subtotal + Tax + Service Charge

## Usage Examples with curl

### Increase Item Quantity

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/edit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "action": "increase",
    "menuItemId": "menu-item-uuid-here",
    "quantity": 3,
    "reason": "Customer added extra items"
  }'
```

### Reduce Item Quantity

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/edit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "action": "reduce",
    "menuItemId": "menu-item-uuid-here",
    "quantity": 2,
    "reason": "Overestimated customer demand"
  }'
```

### Remove Item

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/edit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "action": "remove",
    "menuItemId": "menu-item-uuid-here",
    "quantity": 0,
    "reason": "Item out of stock"
  }'
```

### Add New Menu Item

```bash
curl -X PATCH "http://localhost:3000/api/restaurant/batches/batch-uuid-here/edit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "action": "add",
    "menuItemId": "new-menu-item-uuid-here",
    "quantity": 3,
    "reason": "Customer requested additional dish"
  }'
```

## Audit Trail

All modifications are automatically tracked:

- **Timestamp**: Added to special instructions
- **Staff ID**: Recorded with each modification
- **Reason**: Stored for audit purposes
- **Action Type**: Logged for accountability

## Security & Permissions

### Role-Based Access

- **Kitchen Staff & Waiters**: Can edit batches
- **Supervisors & Admins**: Full edit access
- **Accountants**: View-only (cannot edit)
- **Super Admins**: Full system access

### Cache Invalidation

All batch edits automatically invalidate cache for:

- `/api/restaurant/batches*`
- `/api/restaurant/orders*`
- `/api/reports*`

This ensures data consistency across all related operations.
