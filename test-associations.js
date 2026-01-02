import db from './models/index.js';

console.log('Available models:', Object.keys(db));
console.log('RoomType:', db.RoomType ? 'found' : 'NOT FOUND');
console.log('Room:', db.Room ? 'found' : 'NOT FOUND');
console.log('Reservation:', db.Reservation ? 'found' : 'NOT FOUND');

// Test associations
try {
  console.log('Room associations:', Object.keys(db.Room.associations));
  console.log('RoomType associations:', Object.keys(db.RoomType.associations));
  console.log('Reservation associations:', Object.keys(db.Reservation.associations));
  
  // Test a simple query
  const testQuery = await db.Reservation.findAll({
    limit: 1,
    include: [
      { model: db.Room, as: 'room' }
    ]
  });
  console.log('Simple Room include works');
  
  // Test nested include
  const testNested = await db.Reservation.findAll({
    limit: 1,
    include: [
      { 
        model: db.Room, 
        as: 'room',
        include: [
          { model: db.RoomType, as: 'roomType' }
        ]
      }
    ]
  });
  console.log('Nested RoomType include works');
  
} catch (error) {
  console.error('Association test failed:', error.message);
}
