# Guest Reservation API Documentation

## Overview

The Guest Reservation API provides public endpoints for guests to view available bookings and make reservation requests without authentication. These endpoints are designed for public-facing booking systems.

## Public Endpoints (No Authentication Required)

### 1. View Available Rooms

**Endpoint**: `GET /api/reservations/available`

**Description**: View available rooms grouped by room type. This endpoint shows room types and the number of available rooms for each type, making it easy for guests to see what accommodations are available.

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `startDate` (string): Filter availability for check-in date (YYYY-MM-DD format)
- `endDate` (string): Filter availability for check-out date (YYYY-MM-DD format)
- `roomTypeId` (string): Filter by specific room type ID
- `roomId` (string): Filter by specific room ID or room number

**Filtering Options**:

You can use any combination of these parameters to check availability:

1. **All available rooms** (no filters)
2. **By date range** (startDate + endDate)
3. **By room type** (roomTypeId)
4. **By specific room** (roomId)
5. **Date range + room type** (startDate + endDate + roomTypeId)
6. **Date range + specific room** (startDate + endDate + roomId)

**Response (without dates - shows all available rooms)**:

```json
{
  "success": true,
  "data": [
    {
      "roomType": {
        "id": "uuid",
        "name": "Deluxe Suite",
        "description": "Spacious suite with city view",
        "basePrice": 150.0,
        "capacity": 4,
        "amenities": ["wifi", "minibar", "air_conditioning", "safe"]
      },
      "availableCount": 2
    },
    {
      "roomType": {
        "id": "uuid",
        "name": "Standard Room",
        "description": "Comfortable standard accommodation",
        "basePrice": 80.0,
        "capacity": 2,
        "amenities": ["wifi", "air_conditioning"]
      },
      "availableCount": 3
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Response (with dates - shows available rooms for specific dates)**:

```json
{
  "success": true,
  "data": [
    {
      "roomType": {
        "id": "uuid",
        "name": "Deluxe Suite",
        "description": "Spacious suite with city view",
        "basePrice": 150.0,
        "capacity": 4,
        "amenities": ["wifi", "minibar", "air_conditioning", "safe"]
      },
      "availableCount": 1
    }
  ],
  "searchDates": {
    "startDate": "2026-01-15",
    "endDate": "2026-01-17"
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Example Usage**:

```bash
# View all available rooms (no filters)
curl "http://localhost:3000/api/reservations/available"

# View available rooms for specific date range
curl "http://localhost:3000/api/reservations/available?startDate=2026-01-15&endDate=2026-01-20"

# View available rooms for specific room type
curl "http://localhost:3000/api/reservations/available?roomTypeId=uuid-here"

# View available rooms for specific room
curl "http://localhost:3000/api/reservations/available?roomId=101"

# View available rooms for date range + room type
curl "http://localhost:3000/api/reservations/available?startDate=2026-01-15&endDate=2026-01-20&roomTypeId=uuid-here"

# View available rooms for date range + specific room
curl "http://localhost:3000/api/reservations/available?startDate=2026-01-15&endDate=2026-01-20&roomId=101"
```

### 2. Make Guest Reservation

**Endpoint**: `POST /api/reservations/guest`

**Description**: Submit a reservation request as a guest. Guest reservations start as 'pending' and require staff approval.

**Request Body**:

```json
{
  "roomTypeId": "uuid", // Room type ID instead of room ID
  "checkInDate": "2026-01-15T14:00:00.000Z",
  "checkOutDate": "2026-01-17T11:00:00.000Z",
  "numberOfGuests": 2,
  "specialRequests": "Late check-in requested, ground floor preferred",
  "guestFirstName": "Jane",
  "guestLastName": "Smith",
  "guestEmail": "jane.smith@email.com",
  "guestPhone": "+1234567890"
}
```

**Required Fields**:

- `roomTypeId`: Room type ID (not specific room ID)
- `checkInDate`: Check-in date and time
- `checkOutDate`: Check-out date and time
- `numberOfGuests`: Number of guests
- `guestFirstName`: Guest's first name
- `guestLastName`: Guest's last name
- `guestEmail`: Guest's email address

**Optional Fields**:

- `specialRequests`: Any special requests
- `guestPhone`: Guest's phone number

**Note**: A new guest record is always created for each booking request.

**Response**:

```json
{
  "success": true,
  "message": "Reservation request submitted successfully. You will receive a confirmation email once approved.",
  "data": {
    "id": "uuid",
    "checkInDate": "2026-01-15T14:00:00.000Z",
    "checkOutDate": "2026-01-17T11:00:00.000Z",
    "numberOfGuests": 2,
    "status": "pending",
    "specialRequests": "Late check-in requested, ground floor preferred",
    "source": "guest",
    "totalCost": 300.0,
    "guest": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@email.com",
      "phone": "+1234567890"
    },
    "room": {
      "id": "uuid",
      "roomNumber": "101",
      "status": "available",
      "roomType": {
        "id": "uuid",
        "name": "Deluxe Suite",
        "basePrice": 150.0,
        "capacity": 4
      }
    },
    "costBreakdown": {
      "basePrice": 150.0,
      "nights": 2,
      "totalCost": 300.0,
      "currency": "NGN"
    },
    "printableConfirmation": {
      "reservationNumber": "RES-1735817705123-A1B2C3D4E",
      "guestName": "Jane Smith",
      "guestEmail": "jane.smith@email.com",
      "guestPhone": "+1234567890",
      "roomNumber": "101",
      "roomType": "Deluxe Suite",
      "checkInDate": "2026-01-15T14:00:00.000Z",
      "checkOutDate": "2026-01-17T11:00:00.000Z",
      "numberOfGuests": 2,
      "totalAmount": 300.0,
      "currency": "NGN",
      "status": "pending",
      "specialRequests": "Late check-in requested, ground floor preferred",
      "bookingDate": "2026-01-02T08:45:00.000Z",
      "confirmationMessage": "Your reservation request has been submitted successfully. You will receive a confirmation email once your reservation is approved by our staff.",
      "importantNotes": [
        "This reservation is currently PENDING and requires staff approval.",
        "You will receive an email confirmation when your reservation is approved.",
        "Check-in time is 2:00 PM and check-out time is 11:00 AM.",
        "Please bring a valid ID for verification upon arrival.",
        "For any changes or inquiries, please contact our reception desk."
      ],
      "hotelInfo": {
        "name": "EliteHub Hotel",
        "address": "123 Luxury Avenue, Lagos, Nigeria",
        "phone": "+234-800-000-0000",
        "email": "reservations@elitehubhotel.com"
      }
    },
    "createdAt": "2026-01-02T08:45:00.000Z"
  }
}
```

**Example Usage**:

```bash
curl -X POST "http://localhost:3000/api/reservations/guest" \
  -H "Content-Type: application/json" \
  -d '{
    "roomTypeId": "uuid-here",
    "checkInDate": "2026-01-15T14:00:00.000Z",
    "checkOutDate": "2026-01-17T11:00:00.000Z",
    "numberOfGuests": 2,
    "guestFirstName": "Jane",
    "guestLastName": "Smith",
    "guestEmail": "jane.smith@email.com",
    "guestPhone": "+1234567890",
    "specialRequests": "Late check-in requested"
  }'
```

## Business Logic

### Guest Reservation Flow

1. **Guest submits reservation request** → Status: `pending`
2. **System validates availability** → Checks room capacity and date conflicts
3. **Guest record created** → If guest doesn't exist, creates new guest record
4. **Reservation created** → With `staffId: null` and `source: 'guest'`
5. **Staff approval required** → Staff can review and approve/reject pending reservations

### Validation Rules

- **Room Capacity**: Number of guests cannot exceed room capacity
- **Date Conflicts**: Cannot book overlapping dates with confirmed/pending reservations
- **Room Availability**: Room must exist and be bookable
- **Guest Information**: Valid email and name required

### Status Flow

```
Guest Request → pending → (Staff Review) → confirmed/rejected
```

- **pending**: Initial state for guest reservations
- **confirmed**: After staff approval
- **rejected**: If staff rejects the request

## Security Considerations

### Public Access Control

- **Limited Data**: Guest endpoints only show non-sensitive information
- **Guest Privacy**: Limited guest details shown in public listings
- **No Authentication**: Designed for public access without login
- **Input Validation**: All inputs are validated and sanitized

### Data Protection

- **Email Verification**: Guest email is required for communication
- **Phone Optional**: Phone number is optional for privacy
- **Minimal Exposure**: Only necessary guest information is exposed

## Error Handling

### Common Error Responses

**Room not found**:

```json
{
  "success": false,
  "message": "Room not found"
}
```

**Capacity exceeded**:

```json
{
  "success": false,
  "message": "Room capacity is 4 guests, but 5 guests requested"
}
```

**Date conflict**:

```json
{
  "success": false,
  "message": "Room is already booked for the selected dates"
}
```

**Invalid guest information**:

```json
{
  "success": false,
  "message": "Guest information is required"
}
```

## Integration Examples

### Frontend Booking Form

```javascript
// Frontend booking form submission
const submitGuestReservation = async (bookingData) => {
  try {
    const response = await fetch("/api/reservations/guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (result.success) {
      // Show success message
      alert(
        "Reservation request submitted! You will receive a confirmation email."
      );
      // Redirect to confirmation page
      window.location.href = `/booking-confirmation/${result.data.id}`;
    } else {
      // Show error message
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Booking error:", error);
    alert("An error occurred while submitting your reservation");
  }
};
```

### Availability Check

```javascript
// Check room availability before booking
const checkAvailability = async (roomId, checkIn, checkOut) => {
  try {
    const response = await fetch(
      `/api/reservations/available?roomId=${roomId}&startDate=${checkIn}&endDate=${checkOut}`
    );

    const result = await response.json();

    // Check if room is available
    const isAvailable =
      result.data.length === 0 ||
      !result.data.some(
        (booking) => booking.roomId === roomId && booking.status === "confirmed"
      );

    return isAvailable;
  } catch (error) {
    console.error("Availability check error:", error);
    return false;
  }
};
```

## Rate Limiting

- **Public Protection**: Rate limiting applied to prevent abuse
- **Request Limits**: Limited to reasonable number of requests per IP
- **Validation**: All requests are validated before processing

## Email Notifications

Guest reservations trigger email notifications:

- **Guest**: Confirmation of reservation request
- **Staff**: Notification of pending reservation requiring approval
- **Management**: Daily summary of pending reservations

## Cache Strategy

- **Availability Data**: Cached for 5 minutes to improve performance
- **Room Information**: Cached to reduce database load
- **Auto-invalidation**: Cache invalidated when reservations are created/updated
