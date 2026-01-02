# Restaurant Batch Order Authorization Matrix

## Role-Based Access Control

### User Roles

- **`super_admin`** - Full system access
- **`admin`** - Full restaurant management access
- **`accountant`** - Financial reporting and view-only access
- **`supervisor`** - Operational management access
- **`kitchen_staff`** - Kitchen operations access
- **`waiter`** - Front-of-house operations access

## Batch Order Endpoints Authorization

### 🔍 **View-Only Endpoints**

| Endpoint                             | Method | Roles                                                               | Description           |
| ------------------------------------ | ------ | ------------------------------------------------------------------- | --------------------- |
| `/api/restaurant/batches`            | GET    | `super_admin`, `admin`, `accountant`, `supervisor`, `kitchen_staff` | View all batches      |
| `/api/restaurant/batches/:id`        | GET    | `super_admin`, `admin`, `accountant`, `supervisor`, `kitchen_staff` | View specific batch   |
| `/api/restaurant/batches/date/:date` | GET    | `super_admin`, `admin`, `accountant`, `supervisor`, `kitchen_staff` | View batches by date  |
| `/api/restaurant/batch-orders`       | GET    | `super_admin`, `admin`, `accountant`, `supervisor`                  | View all batch orders |

### ✏️ **Update Endpoints**

| Endpoint                               | Method | Roles                                                           | Description         |
| -------------------------------------- | ------ | --------------------------------------------------------------- | ------------------- |
| `/api/restaurant/batches/:id/status`   | PATCH  | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Update batch status |
| `/api/restaurant/batches/:id/complete` | POST   | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Complete batch      |
| `/api/restaurant/batches/:id/cancel`   | POST   | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Cancel batch        |

### ➕ **Create Endpoints**

| Endpoint                                  | Method | Roles                                                           | Description        |
| ----------------------------------------- | ------ | --------------------------------------------------------------- | ------------------ |
| `/api/restaurant/batch-orders`            | POST   | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Create batch order |
| `/api/restaurant/batches`                 | POST   | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Create batch       |
| `/api/restaurant/batches/:batchId/orders` | POST   | `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter` | Add order to batch |

## Access Summary by Role

### 📊 **Accountants** - View Only

**Can Access:**

- ✅ View all batches
- ✅ View specific batch
- ✅ View batches by date
- ✅ View batch orders

**Cannot Access:**

- ❌ Create batches
- ❌ Update batch status
- ❌ Complete batches
- ❌ Cancel batches
- ❌ Add orders to batches

### 👨‍🍳 **Kitchen Staff** - Full Operational Access

**Can Access:**

- ✅ View all batches
- ✅ View specific batch
- ✅ View batches by date
- ✅ Create batches
- ✅ Update batch status
- ✅ Complete batches
- ✅ Cancel batches
- ✅ Add orders to batches

### 🧑 **Waiters** - Front-of-House Access

**Can Access:**

- ✅ Create batch orders
- ✅ Create batches
- ✅ Update batch status
- ✅ Complete batches
- ✅ Cancel batches
- ✅ Add orders to batches

**Cannot Access:**

- ❌ View batch lists (for security reasons)

### 👨‍💼 **Supervisors** - Management Access

**Can Access:**

- ✅ All batch operations
- ✅ Full view and modify permissions

### 🛡️ **Admins & Super Admins** - Full Access

**Can Access:**

- ✅ All batch operations
- ✅ System-wide permissions

## Security Considerations

### 🚫 **Accountant Restrictions**

Accountants are restricted to view-only access to:

- Prevent unauthorized financial modifications
- Ensure audit trail integrity
- Maintain separation of duties

### 🏪 **Waiter Limitations**

Waiters cannot view batch lists to:

- Prevent data leakage between shifts
- Maintain operational security
- Focus on order creation rather than analysis

### 🔄 **Cache Invalidation**

All update operations automatically invalidate cache for:

- `/api/restaurant/batches*`
- `/api/restaurant/orders*`
- `/api/reports*`

## Usage Examples

### Accountant (View Only)

```bash
# ✅ Allowed - View batches
curl -X GET "http://localhost:3000/api/restaurant/batches" \
  -H "Authorization: Bearer accountant-token"

# ❌ Forbidden - Update status
curl -X PATCH "http://localhost:3000/api/restaurant/batches/id/status" \
  -H "Authorization: Bearer accountant-token" \
  -d '{"status": "completed"}'
# Returns: 403 Forbidden
```

### Kitchen Staff (Full Access)

```bash
# ✅ Allowed - Update status
curl -X PATCH "http://localhost:3000/api/restaurant/batches/id/status" \
  -H "Authorization: Bearer kitchen-token" \
  -d '{"status": "processing"}'

# ✅ Allowed - Complete batch
curl -X POST "http://localhost:3000/api/restaurant/batches/id/complete" \
  -H "Authorization: Bearer kitchen-token" \
  -d '{"paymentMethod": "cash"}'
```

### Waiter (Operational Access)

```bash
# ✅ Allowed - Create batch order
curl -X POST "http://localhost:3000/api/restaurant/batch-orders" \
  -H "Authorization: Bearer waiter-token" \
  -d '{"sources": [...]}'

# ✅ Allowed - Update status
curl -X PATCH "http://localhost:3000/api/restaurant/batches/id/status" \
  -H "Authorization: Bearer waiter-token" \
  -d '{"status": "completed"}'

# ❌ Forbidden - View batch list
curl -X GET "http://localhost:3000/api/restaurant/batches" \
  -H "Authorization: Bearer waiter-token"
# Returns: 403 Forbidden
```

## Error Responses

### 403 Forbidden - Insufficient Permissions

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 401 Unauthorized - Authentication Required

```json
{
  "success": false,
  "message": "Access token is required"
}
```

This authorization matrix ensures proper role-based access control while maintaining security and operational efficiency.
