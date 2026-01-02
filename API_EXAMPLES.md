# EliteHub API Examples - Guest Management

## Overview

This document provides sample API requests and responses for the Guest management endpoints in EliteHub.

---

## 1. Create a New Guest (Standalone)

### Endpoint

```
POST /api/guests
```

### Prerequisites

- Authentication token (JWT)
- User must have authorization (receptionist, manager, admin, or super_admin)

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

### Request Body (Complete Example)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+234 803 123 4567",
  "address": "123 Main Street",
  "city": "Lagos",
  "country": "Nigeria",
  "idType": "passport",
  "idNumber": "N123456789",
  "dateOfBirth": "1985-06-15",
  "nationality": "Nigerian",
  "preferences": {
    "bedType": "king",
    "breakfastPreference": "continental",
    "specialRequests": "Non-smoking room, high floor",
    "pickupRequired": true,
    "dietaryRestrictions": "vegetarian",
    "loyaltyNumber": "LH123456"
  },
  "notes": "VIP guest, prefers ocean view room, allergic to peanuts"
}
```

### Request Body (Minimal Example)

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+234 705 987 6543",
  "idType": "national_id",
  "idNumber": "ID987654321"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/guests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+234 803 123 4567",
    "idType": "passport",
    "idNumber": "N123456789"
  }'
```

### JavaScript/Fetch Example

```javascript
const token = localStorage.getItem("token");

const guestData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+234 803 123 4567",
  address: "123 Main Street",
  city: "Lagos",
  country: "Nigeria",
  idType: "passport",
  idNumber: "N123456789",
  dateOfBirth: "1985-06-15",
  nationality: "Nigerian",
  notes: "VIP guest, prefers ocean view room, allergic to peanuts",
};

const response = await fetch("/api/guests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(guestData),
});

const result = await response.json();
console.log(result);
```

### Python/Requests Example

```python
import requests
import json

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
base_url = "http://localhost:3000/api"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

guest_data = {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+234 803 123 4567",
    "address": "123 Main Street",
    "city": "Lagos",
    "country": "Nigeria",
    "idType": "passport",
    "idNumber": "N123456789",
    "dateOfBirth": "1985-06-15",
    "nationality": "Nigerian",
    "notes": "VIP guest, prefers ocean view room, allergic to peanuts"
}

response = requests.post(
    f"{base_url}/guests",
    headers=headers,
    json=guest_data
)

result = response.json()
print(json.dumps(result, indent=2))
```

---

## 2. Successful Response

### Status Code: 201 Created

### Response Body

```json
{
  "success": true,
  "message": "Guest created successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+234 803 123 4567",
    "address": "123 Main Street",
    "city": "Lagos",
    "country": "Nigeria",
    "idType": "passport",
    "idNumber": "N123456789",
    "dateOfBirth": "1985-06-15",
    "nationality": "Nigerian",
    "preferences": {
      "bedType": "king",
      "breakfastPreference": "continental",
      "specialRequests": "Non-smoking room, high floor",
      "pickupRequired": true,
      "dietaryRestrictions": "vegetarian",
      "loyaltyNumber": "LH123456"
    },
    "createdAt": "2024-12-30T10:30:45.123Z",
    "updatedAt": "2024-12-30T10:30:45.123Z"
  }
}
```

---

## 3. Create a Guest with Reservation (Combined)

### Endpoint

```
POST /api/reservations
```

### Prerequisites

- Authentication token (JWT)
- Valid room ID
- User must have authorization (super_admin, admin, accountant, supervisor, manager, or receptionist)

### Request Body (Complete Example)

```json
{
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+234 803 123 4567",
    "address": "123 Main Street",
    "city": "Lagos",
    "country": "Nigeria",
    "idType": "passport",
    "idNumber": "N123456789",
    "dateOfBirth": "1985-06-15",
    "nationality": "Nigerian",
    "preferences": {
      "bedType": "king",
      "breakfastPreference": "continental",
      "specialRequests": "Non-smoking room, high floor"
    }
  },
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "checkInDate": "2024-12-31T14:00:00Z",
  "checkOutDate": "2025-01-03T11:00:00Z",
  "numberOfGuests": 2,
  "specialRequests": "Non-smoking room preferred",
  "totalPrice": 45000
}
```

### Request Body (Minimal Example)

```json
{
  "guest": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "+234 705 987 6543",
    "idType": "national_id",
    "idNumber": "ID987654321"
  },
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "checkInDate": "2024-12-31T14:00:00Z",
  "checkOutDate": "2025-01-03T11:00:00Z",
  "numberOfGuests": 1
}
```

---

## 4. Error Responses

### 400 Bad Request - Invalid Guest Data

```json
{
  "success": false,
  "message": "Validation Error: Invalid email format"
}
```

### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "message": "Validation Error: firstName is required"
}
```

### 400 Bad Request - Invalid Phone Number

```json
{
  "success": false,
  "message": "Validation Error: phoneNumber must be a valid phone number"
}
```

### 400 Bad Request - Duplicate Email

```json
{
  "success": false,
  "message": "Guest with this email already exists"
}
```

### 400 Bad Request - Duplicate ID Number

```json
{
  "success": false,
  "message": "Guest with this ID number already exists"
}
```

### 401 Unauthorized - Missing Token

```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### 403 Forbidden - Insufficient Permissions

```json
{
  "success": false,
  "message": "You do not have permission to create guests"
}
```

---

## 5. Guest Model Field Descriptions

| Field       | Type   | Required | Description           | Validation                                                       |
| ----------- | ------ | -------- | --------------------- | ---------------------------------------------------------------- |
| firstName   | String | Yes      | Guest's first name    | Max 50 characters                                                |
| lastName    | String | Yes      | Guest's last name     | Max 50 characters                                                |
| email       | String | Yes      | Guest's email address | Must be valid email                                              |
| phoneNumber | String | Yes      | Guest's phone number  | Must be valid phone format                                       |
| address     | String | No       | Street address        | Max 200 characters                                               |
| city        | String | No       | City name             | Max 50 characters                                                |
| country     | String | No       | Country name          | Max 50 characters                                                |
| idType      | String | Yes      | Type of ID            | Must be: passport, drivers_license, or national_id               |
| idNumber    | String | Yes      | ID number             | Max 50 characters                                                |
| dateOfBirth | Date   | No       | Date of birth         | ISO 8601 format (YYYY-MM-DD), 0-120 years ago                    |
| nationality | String | No       | Guest's nationality   | Max 50 characters                                                |
| preferences | JSON   | No       | Guest preferences     | Can include: bedType, breakfastPreference, specialRequests, etc. |

---

## 6. Field Examples & Validation Rules

### ID Type Examples

```javascript
// Valid ID types:
"idType": "passport"           // International passport
"idType": "drivers_license"    // Driver's license
"idType": "national_id"        // National ID card
```

### Phone Number Format

```javascript
// Valid formats:
"+234 803 123 4567";
"+2348031234567";
"08031234567";
"(234) 803-1234";
"+1 (555) 123-4567";
```

### Date of Birth Format

```javascript
// ISO 8601 format:
"1985-06-15"; // YYYY-MM-DD
"1990-12-25";
```

### Preferences Object

```json
{
  "bedType": "king",
  "breakfastPreference": "continental",
  "specialRequests": "Non-smoking, high floor",
  "pickupRequired": true,
  "dietaryRestrictions": "vegetarian",
  "loyaltyNumber": "LH123456",
  "allergies": ["nuts", "dairy"],
  "languagePreference": "english"
}
```

---

## 7. Complete Workflow Example

### Step 1: Authenticate (Get JWT Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elitehub.com",
    "password": "your_password"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "staff": {
      "id": "880e8400-e29b-41d4-a716-446655440333",
      "role": "receptionist"
    }
  }
}
```

### Step 2: Create Guest (Standalone)

```bash
curl -X POST http://localhost:3000/api/guests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+234 803 123 4567",
    "idType": "passport",
    "idNumber": "N123456789"
  }'
```

Response:

```json
{
  "success": true,
  "message": "Guest created successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+234 803 123 4567",
    "idType": "passport",
    "idNumber": "N123456789",
    "createdAt": "2024-12-30T10:30:45.123Z",
    "updatedAt": "2024-12-30T10:30:45.123Z"
  }
}
```

### Step 3: Create Reservation for Existing Guest

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "guestId": "770e8400-e29b-41d4-a716-446655440222",
    "roomId": "550e8400-e29b-41d4-a716-446655440000",
    "checkInDate": "2024-12-31T14:00:00Z",
    "checkOutDate": "2025-01-03T11:00:00Z",
    "numberOfGuests": 2
  }'
```

---

## 8. Other Guest Endpoints

### Get All Guests

```bash
GET /api/guests?page=1&limit=10&search=john&nationality=Nigerian
```

### Get Guest by ID

```bash
GET /api/guests/770e8400-e29b-41d4-a716-446655440222
```

### Search Guests

```bash
GET /api/guests/search?query=john
```

### Update Guest

```bash
PUT /api/guests/770e8400-e29b-41d4-a716-446655440222
```

### Delete Guest (Soft Delete)

```bash
DELETE /api/guests/770e8400-e29b-41d4-a716-446655440222
```

---

## 9. Testing with Postman

### Postman Collection Setup

1. **Create New Request**

   - Method: `POST`
   - URL: `{{base_url}}/api/guests`

2. **Headers Tab**

   ```
   Content-Type: application/json
   Authorization: Bearer {{token}}
   ```

3. **Body Tab (raw, JSON)**

   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john.doe@example.com",
     "phoneNumber": "+234 803 123 4567",
     "address": "123 Main Street",
     "city": "Lagos",
     "country": "Nigeria",
     "idType": "passport",
     "idNumber": "N123456789",
     "dateOfBirth": "1985-06-15",
     "nationality": "Nigerian",
     "preferences": {
       "bedType": "king"
     }
   }
   ```

4. **Environment Variables**
   ```
   base_url: http://localhost:3000/api
   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 10. Rate Limiting & Pagination

### Rate Limiting Headers (Response)

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1609459200
```

### Pagination Parameters

| Parameter   | Type    | Default | Description                                |
| ----------- | ------- | ------- | ------------------------------------------ |
| page        | Integer | 1       | Page number                                |
| limit       | Integer | 10      | Number of guests per page (max 100)        |
| search      | String  | -       | Search guests by name, email, phone, or ID |
| nationality | String  | -       | Filter by nationality                      |
| idType      | String  | -       | Filter by ID type                          |

---

## 11. Common HTTP Status Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 201  | Created - Guest successfully created              |
| 200  | OK - Guest retrieved/updated successfully         |
| 400  | Bad Request - Invalid input data                  |
| 401  | Unauthorized - Missing or invalid token           |
| 403  | Forbidden - Insufficient permissions              |
| 404  | Not Found - Guest not found                       |
| 409  | Conflict - Resource conflict (duplicate email/ID) |
| 500  | Server Error - Internal server error              |

---

## 12. Tips & Best Practices

### ✅ Do's

- Always validate email format on client-side before sending
- Use ISO 8601 format for dates and times
- Include phone number with country code for international guests
- Store the guest ID for future reference
- Handle error responses gracefully in your application
- Use environment variables for API URLs and tokens
- Implement proper error logging
- Check for duplicate guests before creating new ones

### ❌ Don'ts

- Don't send plain text passwords
- Don't hardcode API URLs or tokens
- Don't use invalid date ranges
- Don't duplicate guest records (check email and ID number first)
- Don't expose tokens in browser console
- Don't ignore validation errors
- Don't make synchronous API calls in production
- Don't create guests without proper authorization

---

## 13. Support & Troubleshooting

### Common Issues

**Issue: "Invalid email format"**

- Solution: Ensure email is in valid format (user@domain.com)

**Issue: "phoneNumber must be a valid phone number"**

- Solution: Use international format with country code (+234 803 123 4567)

**Issue: "Guest with this email already exists"**

- Solution: Use different email or retrieve existing guest's ID

**Issue: "Guest with this ID number already exists"**

- Solution: Use different ID number or retrieve existing guest's ID

**Issue: "No authentication token provided"**

- Solution: Include valid JWT token in Authorization header

**Issue: "You do not have permission to create guests"**

- Solution: Ensure user has appropriate role (receptionist, manager, admin, super_admin)

**Issue: "Date of birth must be between 0 and 120 years ago"**

- Solution: Use valid date of birth in YYYY-MM-DD format

For more support, contact: support@elitehub.com

### cURL Example

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "guest": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+234 803 123 4567",
      "idType": "passport",
      "idNumber": "N123456789"
    },
    "roomId": "550e8400-e29b-41d4-a716-446655440000",
    "checkInDate": "2024-12-31T14:00:00Z",
    "checkOutDate": "2025-01-03T11:00:00Z",
    "numberOfGuests": 2
  }'
```

### JavaScript/Fetch Example

```javascript
const token = localStorage.getItem("token");

const guestData = {
  guest: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+234 803 123 4567",
    address: "123 Main Street",
    city: "Lagos",
    country: "Nigeria",
    idType: "passport",
    idNumber: "N123456789",
    dateOfBirth: "1985-06-15",
    nationality: "Nigerian",
    preferences: {
      bedType: "king",
      breakfastPreference: "continental",
    },
  },
  roomId: "550e8400-e29b-41d4-a716-446655440000",
  checkInDate: "2024-12-31T14:00:00Z",
  checkOutDate: "2025-01-03T11:00:00Z",
  numberOfGuests: 2,
  specialRequests: "Non-smoking room preferred",
};

const response = await fetch("/api/reservations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(guestData),
});

const result = await response.json();
console.log(result);
```

### Python/Requests Example

```python
import requests
import json
from datetime import datetime, timedelta

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
base_url = "http://localhost:3000/api"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

guest_data = {
    "guest": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+234 803 123 4567",
        "address": "123 Main Street",
        "city": "Lagos",
        "country": "Nigeria",
        "idType": "passport",
        "idNumber": "N123456789",
        "dateOfBirth": "1985-06-15",
        "nationality": "Nigerian",
        "preferences": {
            "bedType": "king",
            "breakfastPreference": "continental"
        }
    },
    "roomId": "550e8400-e29b-41d4-a716-446655440000",
    "checkInDate": (datetime.now() + timedelta(days=1)).isoformat() + "Z",
    "checkOutDate": (datetime.now() + timedelta(days=4)).isoformat() + "Z",
    "numberOfGuests": 2
}

response = requests.post(
    f"{base_url}/reservations",
    headers=headers,
    json=guest_data
)

result = response.json()
print(json.dumps(result, indent=2))
```

---

## 2. Successful Response

### Status Code: 201 Created

### Response Body

```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "reservation": {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "reservationNumber": "RES-2024-001234",
      "guestId": "770e8400-e29b-41d4-a716-446655440222",
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "staffId": "880e8400-e29b-41d4-a716-446655440333",
      "checkInDate": "2024-12-31T14:00:00Z",
      "checkOutDate": "2025-01-03T11:00:00Z",
      "actualCheckIn": null,
      "actualCheckOut": null,
      "numberOfGuests": 2,
      "status": "confirmed",
      "totalPrice": 45000,
      "paidAmount": 0,
      "paymentStatus": "pending",
      "specialRequests": "Non-smoking room preferred",
      "notes": null,
      "createdAt": "2024-12-30T10:30:45.123Z",
      "updatedAt": "2024-12-30T10:30:45.123Z",
      "deletedAt": null,
      "guest": {
        "id": "770e8400-e29b-41d4-a716-446655440222",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+234 803 123 4567",
        "address": "123 Main Street",
        "city": "Lagos",
        "country": "Nigeria",
        "idType": "passport",
        "idNumber": "N123456789",
        "dateOfBirth": "1985-06-15",
        "nationality": "Nigerian",
        "preferences": {
          "bedType": "king",
          "breakfastPreference": "continental",
          "specialRequests": "Non-smoking room, high floor"
        },
        "createdAt": "2024-12-30T10:30:45.123Z",
        "updatedAt": "2024-12-30T10:30:45.123Z"
      },
      "room": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "roomNumber": "301",
        "type": "deluxe",
        "capacity": 2,
        "price": 15000,
        "status": "reserved",
        "floor": 3,
        "amenities": ["WiFi", "Air Conditioning", "Mini Bar", "Flat-screen TV"]
      },
      "staff": {
        "id": "880e8400-e29b-41d4-a716-446655440333",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah.johnson@elitehub.com",
        "role": "receptionist"
      }
    }
  }
}
```

---

## 3. Error Responses

### 400 Bad Request - Invalid Guest Data

```json
{
  "success": false,
  "message": "Validation Error: Invalid email format"
}
```

### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "message": "Validation Error: firstName is required"
}
```

### 400 Bad Request - Invalid Phone Number

```json
{
  "success": false,
  "message": "Validation Error: phoneNumber must be a valid phone number"
}
```

### 400 Bad Request - Duplicate Email

```json
{
  "success": false,
  "message": "Guest with this email already exists"
}
```

### 400 Bad Request - Invalid Date Range

```json
{
  "success": false,
  "message": "Check-out date must be after check-in date"
}
```

### 404 Not Found - Room Not Found

```json
{
  "success": false,
  "message": "Room not found"
}
```

### 409 Conflict - Room Not Available

```json
{
  "success": false,
  "message": "Room is not available for the selected dates"
}
```

### 401 Unauthorized - Missing Token

```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### 403 Forbidden - Insufficient Permissions

```json
{
  "success": false,
  "message": "You do not have permission to create reservations"
}
```

---

## 4. Guest Model Field Descriptions

| Field       | Type   | Required | Description           | Validation                                                       |
| ----------- | ------ | -------- | --------------------- | ---------------------------------------------------------------- |
| firstName   | String | Yes      | Guest's first name    | -                                                                |
| lastName    | String | Yes      | Guest's last name     | -                                                                |
| email       | String | Yes      | Guest's email address | Must be valid email                                              |
| phoneNumber | String | Yes      | Guest's phone number  | Must be valid phone format                                       |
| address     | String | No       | Street address        | -                                                                |
| city        | String | No       | City name             | -                                                                |
| country     | String | No       | Country name          | -                                                                |
| idType      | String | Yes      | Type of ID            | Must be: passport, drivers_license, or national_id               |
| idNumber    | String | Yes      | ID number             | -                                                                |
| dateOfBirth | Date   | No       | Date of birth         | ISO 8601 format (YYYY-MM-DD)                                     |
| nationality | String | No       | Guest's nationality   | -                                                                |
| preferences | JSON   | No       | Guest preferences     | Can include: bedType, breakfastPreference, specialRequests, etc. |

---

## 5. Field Examples & Validation Rules

### ID Type Examples

```javascript
// Valid ID types:
"idType": "passport"           // International passport
"idType": "drivers_license"    // Driver's license
"idType": "national_id"        // National ID card
```

### Phone Number Format

```javascript
// Valid formats:
"+234 803 123 4567";
"+2348031234567";
"08031234567";
"(234) 803-1234";
"+1 (555) 123-4567";
```

### Date of Birth Format

```javascript
// ISO 8601 format:
"1985-06-15"; // YYYY-MM-DD
"1990-12-25";
```

### Preferences Object

```json
{
  "bedType": "king",
  "breakfastPreference": "continental",
  "specialRequests": "Non-smoking, high floor",
  "pickupRequired": true,
  "dietaryRestrictions": "vegetarian",
  "loyaltyNumber": "LH123456"
}
```

---

## 6. Complete Workflow Example

### Step 1: Authenticate (Get JWT Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elitehub.com",
    "password": "your_password"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "staff": {
      "id": "880e8400-e29b-41d4-a716-446655440333",
      "role": "receptionist"
    }
  }
}
```

### Step 2: Get Available Rooms

```bash
curl -X GET "http://localhost:3000/api/rooms?checkIn=2024-12-31&checkOut=2025-01-03" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "roomNumber": "301",
      "type": "deluxe",
      "capacity": 2,
      "price": 15000,
      "status": "available",
      "amenities": ["WiFi", "AC", "Mini Bar"]
    }
  ]
}
```

### Step 3: Create Guest Reservation

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "guest": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+234 803 123 4567",
      "idType": "passport",
      "idNumber": "N123456789"
    },
    "roomId": "550e8400-e29b-41d4-a716-446655440000",
    "checkInDate": "2024-12-31T14:00:00Z",
    "checkOutDate": "2025-01-03T11:00:00Z",
    "numberOfGuests": 2
  }'
```

---

## 7. Testing with Postman

### Postman Collection Setup

1. **Create New Request**

   - Method: `POST`
   - URL: `{{base_url}}/api/reservations`

2. **Headers Tab**

   ```
   Content-Type: application/json
   Authorization: Bearer {{token}}
   ```

3. **Body Tab (raw, JSON)**

   ```json
   {
     "guest": {
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe@example.com",
       "phoneNumber": "+234 803 123 4567",
       "address": "123 Main Street",
       "city": "Lagos",
       "country": "Nigeria",
       "idType": "passport",
       "idNumber": "N123456789",
       "dateOfBirth": "1985-06-15",
       "nationality": "Nigerian",
       "preferences": {
         "bedType": "king"
       }
     },
     "roomId": "550e8400-e29b-41d4-a716-446655440000",
     "checkInDate": "2024-12-31T14:00:00Z",
     "checkOutDate": "2025-01-03T11:00:00Z",
     "numberOfGuests": 2
   }
   ```

4. **Environment Variables**
   ```
   base_url: http://localhost:3000/api
   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 8. Rate Limiting & Pagination

### Rate Limiting Headers (Response)

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

### Common HTTP Status Codes

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| 201  | Created - Guest/Reservation successfully created                 |
| 400  | Bad Request - Invalid input data                                 |
| 401  | Unauthorized - Missing or invalid token                          |
| 403  | Forbidden - Insufficient permissions                             |
| 404  | Not Found - Resource not found                                   |
| 409  | Conflict - Resource conflict (room unavailable, duplicate email) |
| 500  | Server Error - Internal server error                             |

---

## 9. Tips & Best Practices

### ✅ Do's

- Always validate email format on client-side before sending
- Use ISO 8601 format for dates and times
- Include phone number with country code for international guests
- Store the reservation ID for future reference
- Handle error responses gracefully in your application
- Use environment variables for API URLs and tokens
- Implement proper error logging

### ❌ Don'ts

- Don't send plain text passwords
- Don't hardcode API URLs or tokens
- Don't use invalid date ranges
- Don't duplicate guest records (check email first)
- Don't expose tokens in browser console
- Don't ignore validation errors
- Don't make synchronous API calls in production

---

## 10. Support & Troubleshooting

### Common Issues

**Issue: "Invalid email format"**

- Solution: Ensure email is in valid format (user@domain.com)

**Issue: "phoneNumber must be a valid phone number"**

- Solution: Use international format with country code (+234 803 123 4567)

**Issue: "Room is not available for the selected dates"**

- Solution: Check room availability for selected check-in/check-out dates

**Issue: "No authentication token provided"**

- Solution: Include valid JWT token in Authorization header

**Issue: "Guest with this email already exists"**

- Solution: Use different email or retrieve existing guest's ID

For more support, contact: support@elitehub.com
