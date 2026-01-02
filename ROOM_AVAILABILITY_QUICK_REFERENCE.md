# Room Availability Endpoint - Quick Reference

## 🚀 Quick Start

### Endpoint
```
GET /api/reservations/availability/check?checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD
```

### Minimal Request
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-05&checkOutDate=2025-01-08" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Minimal Response
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully",
  "data": {
    "checkInDate": "2025-01-05T00:00:00.000Z",
    "checkOutDate": "2025-01-08T00:00:00.000Z",
    "totalAvailable": 5,
    "availableRooms": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "roomNumber": "101",
        "floor": 1,
        "status": "available",
        "roomType": {
          "id": "660e8400-e29b-41d4-a716-446655440111",
          "name": "Standard Room",
          "basePrice": 10000,
          "capacity": 2
        }
      }
    ]
  }
}
```

---

## 📋 Implementation Details

### Files Modified/Created

1. **controllers/reservationController.js**
   - ✅ Added `checkRoomAvailability()` method
   - Takes: query params (checkInDate, checkOutDate)
   - Returns: Available rooms with details

2. **services/reservationService.js**
   - ✅ Added `checkRoomAvailability()` method
   - Business logic for availability checking
   - Filters rooms based on:
     - No conflicting reservations
     - Room status is available or reserved
     - Valid date range

3. **routes/reservationRoutes.js**
   - ✅ Added new route: `GET /availability/check`
   - Requires authentication
   - Requires authorization (specific roles)
   - 5-minute cache enabled

---

## 🔍 How It Works

### Step 1: Request
```
GET /api/reservations/availability/check?checkInDate=2025-01-05&checkOutDate=2025-01-08
Authorization: Bearer token...
```

### Step 2: Validation
- ✅ Check token is valid
- ✅ Verify user has proper role
- ✅ Validate dates (format, range)

### Step 3: Query Database
- Get all rooms with room type details
- Find conflicting reservations for date range
- Compare and filter

### Step 4: Response
Return sorted list of available rooms

---

## 🎯 Key Features

✅ **Date Range Validation**
- Check-out must be after check-in
- ISO 8601 date format support

✅ **Conflict Detection**
- Finds overlapping reservations
- Checks reservation status (confirmed/checked-in only)

✅ **Room Filtering**
- Only returns status: available/reserved
- Excludes maintenance/cleaning rooms

✅ **Sorted Results**
- By floor (ascending)
- By room number (ascending)

✅ **Performance**
- 5-minute caching
- Database indexes on key fields

✅ **Authorization**
- Admin roles
- Receptionist
- Manager/Supervisor

---

## 🧪 Test Cases

### Test 1: Basic Availability Check
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-10&checkOutDate=2025-01-12" \
  -H "Authorization: Bearer token"
```
**Expected**: List of available rooms

### Test 2: No Available Rooms
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-01&checkOutDate=2025-01-03" \
  -H "Authorization: Bearer token"
```
**Expected**: Empty array if all rooms booked

### Test 3: Invalid Dates
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-10&checkOutDate=2025-01-05" \
  -H "Authorization: Bearer token"
```
**Expected**: Error - "Check-out date must be after check-in date"

### Test 4: Missing Parameters
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-10" \
  -H "Authorization: Bearer token"
```
**Expected**: Error - "checkInDate and checkOutDate are required"

### Test 5: Invalid Token
```bash
curl -X GET "http://localhost:3000/api/reservations/availability/check?checkInDate=2025-01-10&checkOutDate=2025-01-12" \
  -H "Authorization: Bearer invalid_token"
```
**Expected**: 401 Unauthorized

---

## 💻 Frontend Integration

### React Hook Example
```javascript
import { useEffect, useState } from 'react';

export function useRoomAvailability() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkAvailability = async (checkInDate, checkOutDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/reservations/availability/check?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        setRooms(result.data.availableRooms);
      }
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return { rooms, loading, checkAvailability };
}
```

### Usage in Component
```javascript
function BookingForm() {
  const { rooms, loading, checkAvailability } = useRoomAvailability();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleDateChange = () => {
    if (checkIn && checkOut) {
      checkAvailability(checkIn, checkOut);
    }
  };

  return (
    <div>
      <input
        type="date"
        value={checkIn}
        onChange={(e) => {
          setCheckIn(e.target.value);
          setCheckOut(''); // Reset
        }}
      />
      <input
        type="date"
        value={checkOut}
        onChange={(e) => {
          setCheckOut(e.target.value);
          handleDateChange();
        }}
      />

      {loading && <p>Loading available rooms...</p>}

      <div>
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <h4>Room {room.roomNumber}</h4>
            <p>{room.roomType.name}</p>
            <p>₦{room.roomType.basePrice}/night</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ Role-based authorization
- ✅ Input validation
- ✅ Date format validation
- ✅ SQL injection prevention (Sequelize ORM)

---

## 📊 Database Query

Behind the scenes, the service performs:

```sql
-- Get all rooms with type info
SELECT r.*, rt.* FROM rooms r
LEFT JOIN room_types rt ON r.room_type_id = rt.id
WHERE r.status IN ('available', 'reserved')

-- Find conflicting reservations
SELECT DISTINCT room_id FROM reservations
WHERE status IN ('confirmed', 'checked_in')
AND check_in_date < @checkOutDate
AND check_out_date > @checkInDate
```

---

## 🐛 Debugging

### Check Logs
```bash
tail -f /logs/elitehub.log
```

### Test Query Locally
```javascript
import reservationService from './services/reservationService.js';

const available = await reservationService.checkRoomAvailability(
  '2025-01-05',
  '2025-01-08'
);
console.log(available);
```

---

## 📝 Notes

- **Caching**: Cached responses may show outdated availability
  - Clear cache with: `POST /api/cache/clear` (admin only)
  
- **Rate Limiting**: May be subject to rate limits
  - Default: 100 requests per 15 minutes per user

- **Time Zone**: Uses UTC for all date comparisons
  - Client should convert local times to UTC

---

## 📚 Full Documentation

See `ROOM_AVAILABILITY_API.md` for:
- Complete request/response examples
- All error cases
- Python/cURL examples
- Postman setup
- Troubleshooting guide

---

**Created**: December 30, 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0
