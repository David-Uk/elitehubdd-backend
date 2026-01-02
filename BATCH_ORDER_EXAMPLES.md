# Batch Restaurant Order Examples - EliteHub

This document provides comprehensive examples of batch restaurant orders with all available source options, including detailed request/response formats.

---

## 1. Complete Batch Order with Multiple Sources (Room + Table + Facility)

### Request

```http
POST /api/restaurant/batch-orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sources": [
    {
      "sourceId": "room-101",
      "sourceName": "Room 101 - Mr. Johnson",
      "sourceType": "room",
      "total": 185.00,
      "orders": [
        {
          "id": "menu-item-uuid-1",
          "quantity": 1,
          "specialInstructions": "Well done steak, no vegetables"
        },
        {
          "id": "menu-item-uuid-2",
          "quantity": 2,
          "specialInstructions": "Extra ice, no straw"
        }
      ]
    },
    {
      "sourceId": "table-5",
      "sourceName": "Table 5 - Family of 4",
      "sourceType": "table",
      "total": 142.50,
      "orders": [
        {
          "id": "menu-item-uuid-3",
          "quantity": 2,
          "specialInstructions": "Kids meals - mild spice"
        },
        {
          "id": "menu-item-uuid-4",
          "quantity": 1,
          "specialInstructions": "Gluten-free pasta"
        }
      ]
    },
    {
      "sourceId": "pool-area",
      "sourceName": "Pool Area - Event Catering",
      "sourceType": "facility",
      "total": 320.00,
      "orders": [
        {
          "id": "menu-item-uuid-5",
          "quantity": 10,
          "specialInstructions": "Poolside service, keep cold"
        },
        {
          "id": "menu-item-uuid-6",
          "quantity": 5,
          "specialInstructions": "No nuts, allergy alert"
        }
      ]
    }
  ],
  "notes": "VIP weekend package - Priority handling for all sources"
}
```

### Response

```json
{
  "success": true,
  "message": "Batch order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "batchId": "BATCH-250102-143022-123",
    "staffId": "staff-uuid-123",
    "status": "pending",
    "totalItems": 21,
    "totalAmount": 647.5,
    "tax": 32.38,
    "serviceCharge": 64.75,
    "notes": "VIP weekend package - Priority handling for all sources",
    "completedAt": null,
    "createdAt": "2025-01-02T14:30:22.000Z",
    "updatedAt": "2025-01-02T14:30:22.000Z",
    "staff": {
      "id": "staff-uuid-123",
      "username": "john_waiter",
      "firstName": "John",
      "lastName": "Smith"
    },
    "sources": [
      {
        "id": "source-uuid-1",
        "batchId": "550e8400-e29b-41d4-a716-446655440000",
        "sourceId": "room-101",
        "sourceName": "Room 101 - Mr. Johnson",
        "sourceType": "room",
        "total": 185.0,
        "orders": [
          {
            "id": "order-uuid-1",
            "orderNumber": "RO250102143022-0001",
            "batchId": "550e8400-e29b-41d4-a716-446655440000",
            "batchSourceId": "source-uuid-1",
            "tableNumber": null,
            "orderType": "room_service",
            "status": "pending",
            "subtotal": 120.0,
            "tax": 6.0,
            "serviceCharge": 12.0,
            "totalAmount": 138.0,
            "paymentStatus": "pending",
            "items": [
              {
                "id": "item-uuid-1",
                "orderId": "order-uuid-1",
                "menuItemId": "menu-item-uuid-1",
                "quantity": 1,
                "unitPrice": 85.0,
                "totalPrice": 85.0,
                "specialInstructions": "Well done steak, no vegetables",
                "menuItem": {
                  "id": "menu-item-uuid-1",
                  "name": "Grilled Ribeye Steak",
                  "category": "main_course",
                  "price": 85.0
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 2. Room Service Only Batch Order

### Request

```http
POST /api/restaurant/batch-orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sources": [
    {
      "sourceId": "room-205",
      "sourceName": "Room 205 - Smith Family",
      "sourceType": "room",
      "total": 95.00,
      "orders": [
        {
          "id": "menu-item-uuid-7",
          "quantity": 2,
          "specialInstructions": "Room 205, deliver to main bedroom"
        },
        {
          "id": "menu-item-uuid-8",
          "quantity": 1,
          "specialInstructions": "Warm milk for child"
        }
      ]
    },
    {
      "sourceId": "room-206",
      "sourceName": "Room 206 - Business Guest",
      "sourceType": "room",
      "total": 45.00,
      "orders": [
        {
          "id": "menu-item-uuid-9",
          "quantity": 1,
          "specialInstructions": "Quick service, guest has meeting"
        }
      ]
    }
  ],
  "notes": "Executive floor room service - expedited delivery"
}
```

### Response

```json
{
  "success": true,
  "message": "Batch order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "batchId": "BATCH-250102-144515-456",
    "staffId": "staff-uuid-123",
    "status": "pending",
    "totalItems": 4,
    "totalAmount": 140.00,
    "tax": 7.00,
    "serviceCharge": 14.00,
    "notes": "Executive floor room service - expedited delivery",
    "completedAt": null,
    "createdAt": "2025-01-02T14:45:15.000Z",
    "updatedAt": "2025-01-02T14:45:15.000Z",
    "sources": [
      {
        "id": "source-uuid-2",
        "batchId": "550e8400-e29b-41d4-a716-446655440001",
        "sourceId": "room-205",
        "sourceName": "Room 205 - Smith Family",
        "sourceType": "room",
        "total": 95.00,
        "orders": [...]
      },
      {
        "id": "source-uuid-3",
        "batchId": "550e8400-e29b-41d4-a716-446655440001",
        "sourceId": "room-206",
        "sourceName": "Room 206 - Business Guest",
        "sourceType": "room",
        "total": 45.00,
        "orders": [...]
      }
    ]
  }
}
```

---

## 3. Restaurant Table Batch Order

### Request

```http
POST /api/restaurant/batch-orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sources": [
    {
      "sourceId": "table-1",
      "sourceName": "Table 1 - Anniversary Couple",
      "sourceType": "table",
      "total": 180.00,
      "orders": [
        {
          "id": "menu-item-uuid-10",
          "quantity": 1,
          "specialInstructions": "Anniversary special - add rose petals"
        },
        {
          "id": "menu-item-uuid-11",
          "quantity": 1,
          "specialInstructions": "Wine pairing recommended"
        }
      ]
    },
    {
      "sourceId": "table-2",
      "sourceName": "Table 2 - Business Lunch",
      "sourceType": "table",
      "total": 240.00,
      "orders": [
        {
          "id": "menu-item-uuid-12",
          "quantity": 4,
          "specialInstructions": "Split bills required"
        }
      ]
    }
  ],
  "notes": "Lunch rush - Priority for business table"
}
```

### Response

```json
{
  "success": true,
  "message": "Batch order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "batchId": "BATCH-250102-123000-789",
    "staffId": "staff-uuid-123",
    "status": "pending",
    "totalItems": 6,
    "totalAmount": 420.00,
    "tax": 21.00,
    "serviceCharge": 42.00,
    "notes": "Lunch rush - Priority for business table",
    "completedAt": null,
    "createdAt": "2025-01-02T12:30:00.000Z",
    "updatedAt": "2025-01-02T12:30:00.000Z",
    "sources": [
      {
        "id": "source-uuid-4",
        "batchId": "550e8400-e29b-41d4-a716-446655440002",
        "sourceId": "table-1",
        "sourceName": "Table 1 - Anniversary Couple",
        "sourceType": "table",
        "total": 180.00,
        "orders": [...]
      },
      {
        "id": "source-uuid-5",
        "batchId": "550e8400-e29b-41d4-a716-446655440002",
        "sourceId": "table-2",
        "sourceName": "Table 2 - Business Lunch",
        "sourceType": "table",
        "total": 240.00,
        "orders": [...]
      }
    ]
  }
}
```

---

## 4. Facility/Event Catering Batch Order

### Request

```http
POST /api/restaurant/batch-orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sources": [
    {
      "sourceId": "conference-room-a",
      "sourceName": "Conference Room A - Corporate Event",
      "sourceType": "facility",
      "total": 850.00,
      "orders": [
        {
          "id": "menu-item-uuid-13",
          "quantity": 20,
          "specialInstructions": "Buffet setup, vegetarian options available"
        },
        {
          "id": "menu-item-uuid-14",
          "quantity": 20,
          "specialInstructions": "Include dessert platters"
        }
      ]
    },
    {
      "sourceId": "pool-area",
      "sourceName": "Pool Area - Pool Party",
      "sourceType": "facility",
      "total": 420.00,
      "orders": [
        {
          "id": "menu-item-uuid-15",
          "quantity": 15,
          "specialInstructions": "Poolside service, keep items cold"
        },
        {
          "id": "menu-item-uuid-16",
          "quantity": 10,
          "specialInstructions": "Non-alcoholic beverages only"
        }
      ]
    }
  ],
  "notes": "Weekend event catering - Setup required 1 hour before event"
}
```

### Response

```json
{
  "success": true,
  "message": "Batch order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "batchId": "BATCH-250102-100000-321",
    "staffId": "staff-uuid-123",
    "status": "pending",
    "totalItems": 65,
    "totalAmount": 1270.00,
    "tax": 63.50,
    "serviceCharge": 127.00,
    "notes": "Weekend event catering - Setup required 1 hour before event",
    "completedAt": null,
    "createdAt": "2025-01-02T10:00:00.000Z",
    "updatedAt": "2025-01-02T10:00:00.000Z",
    "sources": [
      {
        "id": "source-uuid-6",
        "batchId": "550e8400-e29b-41d4-a716-446655440003",
        "sourceId": "conference-room-a",
        "sourceName": "Conference Room A - Corporate Event",
        "sourceType": "facility",
        "total": 850.00,
        "orders": [...]
      },
      {
        "id": "source-uuid-7",
        "batchId": "550e8400-e29b-41d4-a716-446655440003",
        "sourceId": "pool-area",
        "sourceName": "Pool Area - Pool Party",
        "sourceType": "facility",
        "total": 420.00,
        "orders": [...]
      }
    ]
  }
}
```

---

## 5. Mixed Source Types - Complex Event

### Request

```http
POST /api/restaurant/batch-orders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sources": [
    {
      "sourceId": "room-301",
      "sourceName": "Room 301 - Bridal Suite",
      "sourceType": "room",
      "total": 280.00,
      "orders": [
        {
          "id": "menu-item-uuid-17",
          "quantity": 2,
          "specialInstructions": "Champagne breakfast for bride and groom"
        }
      ]
    },
    {
      "sourceId": "table-10",
      "sourceName": "Table 10 - Wedding Party",
      "sourceType": "table",
      "total": 650.00,
      "orders": [
        {
          "id": "menu-item-uuid-18",
          "quantity": 8,
          "specialInstructions": "Wedding package - all meals included"
        }
      ]
    },
    {
      "sourceId": "garden-area",
      "sourceName": "Garden Area - Wedding Reception",
      "sourceType": "facility",
      "total": 1200.00,
      "orders": [
        {
          "id": "menu-item-uuid-19",
          "quantity": 50,
          "specialInstructions": "Wedding reception catering"
        },
        {
          "id": "menu-item-uuid-20",
          "quantity": 50,
          "specialInstructions": "Wedding cake and desserts"
        }
      ]
    }
  ],
  "notes": "Wedding day package - Coordinate with events team"
}
```

### Response

```json
{
  "success": true,
  "message": "Batch order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "batchId": "BATCH-250102-080000-999",
    "staffId": "staff-uuid-123",
    "status": "pending",
    "totalItems": 110,
    "totalAmount": 2130.00,
    "tax": 106.50,
    "serviceCharge": 213.00,
    "notes": "Wedding day package - Coordinate with events team",
    "completedAt": null,
    "createdAt": "2025-01-02T08:00:00.000Z",
    "updatedAt": "2025-01-02T08:00:00.000Z",
    "sources": [...]
  }
}
```

---

## Source Options Summary

### 1. **Room Service** (`sourceType: "room"`)

- **Use Case**: In-room dining for hotel guests
- **Source ID**: Room number (e.g., "room-101")
- **Source Name**: Descriptive name with guest info
- **Order Type**: Automatically set to `room_service`
- **Table Number**: Set to null

### 2. **Restaurant Table** (`sourceType: "table"`)

- **Use Case**: Restaurant dining orders
- **Source ID**: Table number (e.g., "table-5")
- **Source Name**: Table number with party description
- **Order Type**: Automatically set to `dine_in`
- **Table Number**: Populated from source name

### 3. **Facility/Event** (`sourceType: "facility"`)

- **Use Case**: Catering for hotel facilities and events
- **Source ID**: Facility identifier (e.g., "pool-area", "conference-room-a")
- **Source Name**: Facility name with event description
- **Order Type**: Automatically set to `dine_in`
- **Table Number**: Set to null

---

## Error Response Examples

### Validation Error

```json
{
  "success": false,
  "message": "Menu item menu-item-uuid-999 not found"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Missing Required Fields

```json
{
  "success": false,
  "message": "Sources array is required"
}
```

---

## cURL Examples

### Room Service Batch

```bash
curl -X POST http://localhost:3000/api/restaurant/batch-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "sources": [
      {
        "sourceId": "room-101",
        "sourceName": "Room 101 - Guest Name",
        "sourceType": "room",
        "total": 95.00,
        "orders": [
          {
            "id": "menu-item-uuid",
            "quantity": 1,
            "specialInstructions": "Room service"
          }
        ]
      }
    ],
    "notes": "Room service order"
  }'
```

### Mixed Sources Batch

```bash
curl -X POST http://localhost:3000/api/restaurant/batch-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "sources": [
      {
        "sourceId": "room-101",
        "sourceName": "Room 101",
        "sourceType": "room",
        "total": 50.00,
        "orders": [{"id": "menu-uuid-1", "quantity": 1}]
      },
      {
        "sourceId": "table-5",
        "sourceName": "Table 5",
        "sourceType": "table",
        "total": 75.00,
        "orders": [{"id": "menu-uuid-2", "quantity": 2}]
      }
    ],
    "notes": "Mixed order batch"
  }'
```

---

## JavaScript/Fetch Examples

### Complete Batch Order

```javascript
const batchOrder = {
  sources: [
    {
      sourceId: "room-101",
      sourceName: "Room 101 - VIP Guest",
      sourceType: "room",
      total: 150.0,
      orders: [
        {
          id: "menu-item-uuid-steak",
          quantity: 1,
          specialInstructions: "Medium rare, no sauce",
        },
      ],
    },
  ],
  notes: "VIP room service - expedited",
};

const response = await fetch("/api/restaurant/batch-orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(batchOrder),
});

const result = await response.json();
console.log("Batch created:", result.data.batchId);
```

### Event Catering Batch

```javascript
const eventBatch = {
  sources: [
    {
      sourceId: "conference-room-b",
      sourceName: "Conference Room B - Corporate Training",
      sourceType: "facility",
      total: 500.0,
      orders: [
        {
          id: "menu-item-uuid-coffee",
          quantity: 25,
          specialInstructions: "Coffee service with pastries",
        },
        {
          id: "menu-item-uuid-lunch",
          quantity: 25,
          specialInstructions: "Buffet lunch setup",
        },
      ],
    },
  ],
  notes: "Corporate training event - all day service",
};

const response = await fetch("/api/restaurant/batch-orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(eventBatch),
});
```

---

## Key Points to Remember

1. **All menu item IDs must exist** in the system
2. **Quantities must be positive integers**
3. **Source types are limited to**: `room`, `table`, `facility`
4. **Total amounts are calculated automatically** but can be provided for reference
5. **Special instructions are optional** but recommended for better service
6. **Batch IDs are generated automatically** with timestamp format
7. **Staff authentication is required** for all batch operations
8. **Tax (5%) and service charge (10%) are calculated automatically**

This comprehensive guide covers all possible batch order scenarios in the EliteHub restaurant system.
