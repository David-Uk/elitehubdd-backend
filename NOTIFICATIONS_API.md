# Notifications API Documentation

## Overview

The Notifications API provides comprehensive logging and tracking of all API actions (except GET requests) with role-based access control. It automatically logs all POST, PUT, PATCH, and DELETE requests across the entire application.

## Features

- **Automatic Logging**: All non-GET API calls are automatically logged
- **Role-Based Access**: Admins and super admins see all actions, other users see their own actions
- **Rich Metadata**: Captures request details, user information, IP addresses, and more
- **Real-time Updates**: Supports WebSocket notifications for live updates
- **Statistics**: Provides notification analytics and counts

## Access Control

### Visibility Rules

- **Super Admin**: Can see all notifications from all users
- **Admin**: Can see all notifications from all users
- **Other Roles**: Can see notifications where:
  - Their role is in the target roles array
  - They are the performer of the action (their own staffId)

### Target Roles by Action Type

- **Reservations**: `supervisor`, `front_desk`
- **Orders/Batches**: `kitchen_staff`, `waiter`, `supervisor`
- **Menu Items**: `kitchen_staff`, `supervisor`
- **Inventory**: `supervisor`, `store_keeper`
- **Staff**: `supervisor`, `hr`
- **All Actions**: Always include `super_admin`, `admin`, and the performer's role

## API Endpoints

### Get Notifications

```http
GET /api/notifications
```

**Authorization**: `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter`, `accountant`

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by notification type (`info`, `success`, `warning`, `error`)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "POST_ORDER",
      "type": "success",
      "message": "John Doe created /api/restaurant/orders successfully",
      "metadata": {
        "method": "POST",
        "url": "/api/restaurant/orders",
        "body": { "tableNumber": "A1", "items": [...] },
        "params": {},
        "query": {},
        "statusCode": 201
      },
      "targetRoles": ["super_admin", "admin", "kitchen_staff", "waiter", "supervisor"],
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "read": false,
      "createdAt": "2026-01-02T08:30:00.000Z",
      "staff": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "role": "kitchen_staff"
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Get Notification Statistics

```http
GET /api/notifications/stats
```

**Authorization**: `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter`, `accountant`

**Response**:

```json
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 25,
    "byType": [
      { "type": "success", "count": 120 },
      { "type": "error", "count": 15 },
      { "type": "warning", "count": 10 },
      { "type": "info", "count": 5 }
    ]
  }
}
```

### Mark Notification as Read

```http
PATCH /api/notifications/:id/read
```

**Authorization**: `super_admin`, `admin`, `supervisor`, `kitchen_staff`, `waiter`, `accountant`

**Response**:

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Clear All Notifications (Super Admin Only)

```http
DELETE /api/notifications/clear-all
```

**Authorization**: `super_admin` only

**Response**:

```json
{
  "success": true,
  "message": "All notifications cleared successfully"
}
```

## Automatic Logging

The system automatically logs all API actions with the following information:

### Logged Data

- **Action**: Method + resource type (e.g., `POST_ORDER`, `PATCH_BATCH`)
- **Message**: Human-readable description of the action
- **User Information**: Who performed the action
- **Request Details**: Method, URL, body, parameters, query
- **Response Details**: Status code
- **Metadata**: IP address, user agent, timestamp
- **Target Roles**: Which roles can view this notification

### Action Mapping

| URL Pattern     | Action Prefix |
| --------------- | ------------- |
| `/reservations` | `RESERVATION` |
| `/orders`       | `ORDER`       |
| `/batches`      | `BATCH`       |
| `/menu-items`   | `MENU_ITEM`   |
| `/inventory`    | `INVENTORY`   |
| `/staff`        | `STAFF`       |
| `/auth`         | `AUTH`        |
| `/reports`      | `REPORT`      |

### Notification Types

- **Success** (2xx status codes): Successful operations
- **Warning** (3xx status codes): Redirects or warnings
- **Error** (4xx/5xx status codes): Failed operations
- **Info**: General information

## Example Usage

### Creating an Order (Automatic Logging)

```http
POST /api/restaurant/orders
Authorization: Bearer token
Content-Type: application/json

{
  "tableNumber": "A1",
  "items": [
    { "menuItemId": "uuid", "quantity": 2 }
  ]
}
```

**Automatically Created Notification**:

```json
{
  "action": "POST_ORDER",
  "type": "success",
  "message": "John Doe created /api/restaurant/orders successfully",
  "metadata": {
    "method": "POST",
    "url": "/api/restaurant/orders",
    "body": { "tableNumber": "A1", "items": [...] },
    "statusCode": 201
  },
  "targetRoles": ["super_admin", "admin", "kitchen_staff", "waiter", "supervisor"]
}
```

### Viewing Notifications as Different Users

**Super Admin sees**: All notifications from all users

**Kitchen Staff sees**:

- Notifications where `kitchen_staff` is in target roles
- Their own notifications (where they are the performer)

**Waiter sees**:

- Notifications where `waiter` is in target roles
- Their own notifications

## WebSocket Integration

Notifications are broadcast in real-time to relevant roles:

```javascript
// Client-side WebSocket connection
const socket = io();
socket.on("notification", (notification) => {
  console.log("New notification:", notification);
});

// Join role-specific room (handled automatically)
socket.emit("join", { role: "kitchen_staff" });
```

## Security Considerations

- **Sensitive Data**: Passwords and sensitive fields are automatically masked
- **Access Control**: Strict role-based access to notification viewing
- **Audit Trail**: Complete audit trail of all system actions
- **IP Tracking**: All actions include IP address for security auditing

## Performance

- **Async Logging**: Notifications are logged asynchronously to avoid blocking requests
- **Pagination**: Large notification sets are paginated for performance
- **Indexing**: Database indexes on common query fields
- **Caching**: Statistics can be cached for better performance

## Error Handling

- **Graceful Degradation**: Notification logging failures don't affect main functionality
- **Retry Logic**: Failed logging attempts are logged but don't retry
- **Validation**: Invalid notification data is handled gracefully
