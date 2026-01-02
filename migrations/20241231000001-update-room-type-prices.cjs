'use strict';

const crypto = require('crypto');

module.exports = {
  async up(queryInterface) {
    try {
      const roomTypeUpdates = [
        { name: 'executive', basePrice: 85000 },
        { name: 'delux', basePrice: 69000 },
        { name: 'comfort', basePrice: 57000 },
        { name: 'penthouse', basePrice: 130000 },
        { name: '2 bedroom duplex', basePrice: 195000 },
        { name: '2 bedroom flat', basePrice: 150000 },
        { name: '3 bedroom duplex', basePrice: 265000 }
      ];

      for (const roomType of roomTypeUpdates) {
        const result = await queryInterface.bulkUpdate(
          'room_types',
          { base_price: roomType.basePrice },
          { name: roomType.name }
        );

        // Sequelize sometimes returns [affected] or just affected
        const affectedRows = Array.isArray(result) ? result[0] : result;

        if (affectedRows === 0) {
          // Insert if not found
          await queryInterface.bulkInsert('room_types', [
            {
              id: crypto.randomUUID(), // FIXED UUID ISSUE
              name: roomType.name,
              description:
                `${roomType.name.charAt(0).toUpperCase() + roomType.name.slice(1)} room type`,
              capacity:
                roomType.name.includes('2 bedroom') ? 4 :
                roomType.name.includes('3 bedroom') ? 6 : 2,
              base_price: roomType.basePrice,
              amenities: JSON.stringify([
                'WiFi',
                'Air Conditioning',
                'Mini Bar',
                'Flat-screen TV'
              ]),
              bed_type:
                roomType.name.includes('duplex') || roomType.name.includes('flat')
                  ? 'king'
                  : 'queen',
              number_of_beds:
                roomType.name.includes('2 bedroom') ? 2 :
                roomType.name.includes('3 bedroom') ? 3 : 1,
              size:
                roomType.name.includes('duplex') || roomType.name.includes('flat')
                  ? 120
                  : 45,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);
        }
      }

      console.log('✅ Room types updated with new prices');
    } catch (error) {
      console.error('❌ Error updating room types:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      const originalPrices = [
        { name: 'executive', basePrice: 75000 },
        { name: 'delux', basePrice: 60000 },
        { name: 'comfort', basePrice: 50000 },
        { name: 'penthouse', basePrice: 120000 },
        { name: '2 bedroom duplex', basePrice: 180000 },
        { name: '2 bedroom flat', basePrice: 140000 },
        { name: '3 bedroom duplex', basePrice: 250000 }
      ];

      for (const roomType of originalPrices) {
        await queryInterface.bulkUpdate(
          'room_types',
          { base_price: roomType.basePrice },
          { name: roomType.name }
        );
      }

      console.log('✅ Room types reverted to original prices');
    } catch (error) {
      console.error('❌ Error reverting room types:', error.message);
      throw error;
    }
  }
};
