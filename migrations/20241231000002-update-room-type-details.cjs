'use strict';

const crypto = require('crypto');

module.exports = {
  async up(queryInterface) {
    try {
      const roomTypeUpdates = [
        {
          name: 'delux',
          description: 'A thoughtfully designed room featuring refined interiors and modern comforts, ideal for guests who appreciate simplicity, privacy, and attention to detail.',
          amenities: JSON.stringify([
            'King-size bed',
            'Modern glass-enclosed bathroom',
            'High-speed Wi-Fi',
            'Work desk',
            'Smart TV',
            'Rooftop Lounge Access'
          ]),
          capacity: 2,
          bedType: 'king',
          numberOfBeds: 1,
          size: 45
        },
        {
          name: 'executive',
          description: 'Designed for elevated comfort, the Executive Room offers additional space and refined finishes, making it perfect for business travelers and guests seeking a higher level of comfort.',
          amenities: JSON.stringify([
            'Spacious king-size bed',
            'Comfortable seating area',
            'Smart TV',
            'High-speed Wi-Fi',
            'Premium amenities',
            'Rooftop Lounge Access'
          ]),
          capacity: 2,
          bedType: 'king',
          numberOfBeds: 1,
          size: 55
        },
        {
          name: '2 bedroom duplex',
          description: 'A fully serviced apartment offering generous space, privacy, and refined comfort. Featuring an open-plan living lounge with swimming pool views, every detail is thoughtfully designed to elevate your stay.',
          amenities: JSON.stringify([
            'Two well-appointed bedrooms',
            'Private living and dining area',
            'Fully equipped kitchen',
            'High-speed Wi-Fi',
            'Smart TV',
            'Modern glass-enclosed bathroom',
            'Housekeeping and security services'
          ]),
          capacity: 4,
          bedType: 'king',
          numberOfBeds: 2,
          size: 120
        },
        {
          name: 'penthouse',
          description: 'An exclusive penthouse offering enhanced privacy, generous space, and direct access to the rooftop lounge. Featuring a separate sitting room and private balcony, every detail is designed to elevate your stay.',
          amenities: JSON.stringify([
            'King-size bed',
            'Separate sitting room',
            'Private balcony',
            'Direct access to rooftop lounge',
            'Modern glass-enclosed bathroom',
            'High-speed Wi-Fi',
            'Smart TV'
          ]),
          capacity: 2,
          bedType: 'king',
          numberOfBeds: 1,
          size: 80
        },
        {
          name: 'comfort',
          description: 'A welcoming room designed for ease and relaxation, offering essential comforts in a calm, thoughtfully arranged space ideal for short and extended stays.',
          amenities: JSON.stringify([
            'Comfortable queen-size bed',
            'Modern glass-enclosed bathroom',
            'High-speed Wi-Fi',
            'Smart TV',
            'Work desk',
            'Daily housekeeping'
          ]),
          capacity: 2,
          bedType: 'queen',
          numberOfBeds: 1,
          size: 40
        },
        {
          name: '3 bedroom duplex',
          description: 'A spacious duplex apartment designed for families and group stays, featuring upper-level bedrooms that provide added privacy and separation from the living areas. Every space is thoughtfully arranged to support relaxed living and elevated comfort.',
          amenities: JSON.stringify([
            'Three well-appointed bedrooms',
            'Spacious open-plan living lounge',
            'Fully equipped kitchen',
            'Dedicated dining area',
            'Comfortable lounge seating',
            'Private balcony',
            'Modern glass-enclosed bathrooms',
            'High-speed Wi-Fi',
            'Smart TV'
          ]),
          capacity: 6,
          bedType: 'king',
          numberOfBeds: 3,
          size: 150
        },
        {
          name: '2 bedroom flat',
          description: 'A well-appointed apartment designed for comfort and ease, offering a balanced layout with generous living spaces. Ideal for families, colleagues, or extended stays, the flat combines functionality with thoughtful details that elevate everyday living.',
          amenities: JSON.stringify([
            'Two well-appointed bedrooms',
            'Spacious living lounge',
            'Fully equipped kitchen',
            'Dedicated dining area',
            'Comfortable lounge seating',
            'Modern glass-enclosed bathroom',
            'High-speed Wi-Fi',
            'Smart TV'
          ]),
          capacity: 4,
          bedType: 'king',
          numberOfBeds: 2,
          size: 100
        }
      ];

      for (const roomType of roomTypeUpdates) {
        const result = await queryInterface.bulkUpdate(
          'room_types',
          {
            description: roomType.description,
            amenities: roomType.amenities,
            capacity: roomType.capacity,
            bed_type: roomType.bedType,
            number_of_beds: roomType.numberOfBeds,
            size: roomType.size
          },
          { name: roomType.name }
        );

        // Sequelize sometimes returns [affected] or just affected
        const affectedRows = Array.isArray(result) ? result[0] : result;

        if (affectedRows === 0) {
          // Insert if not found
          await queryInterface.bulkInsert('room_types', [
            {
              id: crypto.randomUUID(),
              name: roomType.name,
              description: roomType.description,
              capacity: roomType.capacity,
              base_price: roomType.name === 'executive' ? 85000 :
                          roomType.name === 'delux' ? 69000 :
                          roomType.name === 'comfort' ? 57000 :
                          roomType.name === 'penthouse' ? 130000 :
                          roomType.name === '2 bedroom duplex' ? 195000 :
                          roomType.name === '2 bedroom flat' ? 150000 :
                          roomType.name === '3 bedroom duplex' ? 265000 : 50000,
              amenities: roomType.amenities,
              bed_type: roomType.bedType,
              number_of_beds: roomType.numberOfBeds,
              size: roomType.size,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);
        }
      }

      console.log('✅ Room types updated with detailed descriptions and amenities');
    } catch (error) {
      console.error('❌ Error updating room types:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      // Revert to simple descriptions
      const simpleDescriptions = [
        { name: 'delux', description: 'Deluxe room with modern amenities' },
        { name: 'executive', description: 'Executive room for business travelers' },
        { name: '2 bedroom duplex', description: 'Two bedroom duplex apartment' },
        { name: 'penthouse', description: 'Luxury penthouse with premium amenities' },
        { name: 'comfort', description: 'Comfortable room for relaxation' },
        { name: '3 bedroom duplex', description: 'Three bedroom duplex apartment' },
        { name: '2 bedroom flat', description: 'Two bedroom apartment' }
      ];

      for (const roomType of simpleDescriptions) {
        await queryInterface.bulkUpdate(
          'room_types',
          {
            description: roomType.description,
            amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Mini Bar', 'Flat-screen TV'])
          },
          { name: roomType.name }
        );
      }

      console.log('✅ Room types reverted to simple descriptions');
    } catch (error) {
      console.error('❌ Error reverting room types:', error.message);
      throw error;
    }
  }
};
