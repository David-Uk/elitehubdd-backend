'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Delete existing room types to ensure clean state
    await queryInterface.sequelize.query('TRUNCATE TABLE room_types CASCADE;');

    // Insert new room types with correct pricing and details
    await queryInterface.bulkInsert('room_types', [
      {
        id: uuidv4(),
        name: '3 Bedroom Duplex',
        description: 'Spacious 3-bedroom duplex with modern amenities, perfect for families and groups',
        capacity: 6,
        base_price: 280000.00,
        bed_type: 'king',
        number_of_beds: 3,
        size: 350,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Full Kitchen',
          'Living Room',
          'Dining Area',
          '2 Bathrooms',
          'TV',
          'Parking'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: '2 Bedroom Flat',
        description: 'Comfortable 2-bedroom flat with essential amenities, ideal for couples and small families',
        capacity: 4,
        base_price: 160000.00,
        bed_type: 'queen',
        number_of_beds: 2,
        size: 180,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Kitchen',
          'Living Area',
          '1 Bathroom',
          'TV',
          'Parking'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: '2 Bedroom Duplex',
        description: 'Premium 2-bedroom duplex with upscale finishes and additional space',
        capacity: 4,
        base_price: 220000.00,
        bed_type: 'queen',
        number_of_beds: 2,
        size: 240,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Full Kitchen',
          'Living Room',
          'Dining Area',
          '2 Bathrooms',
          'TV',
          'Parking'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: 'Penthouse',
        description: 'Luxury penthouse with panoramic views, perfect for special occasions and VIP guests',
        capacity: 4,
        base_price: 145000.00,
        bed_type: 'king',
        number_of_beds: 2,
        size: 220,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Kitchenette',
          'Living Room',
          'Panoramic Views',
          '2 Bathrooms',
          'Smart TV',
          'Parking',
          'Rooftop Access'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: 'Comfort Room',
        description: 'Cozy, budget-friendly room with essential comfort amenities',
        capacity: 2,
        base_price: 60000.00,
        bed_type: 'double',
        number_of_beds: 1,
        size: 25,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Flat-screen TV',
          'Private Bathroom',
          'Basic Toiletries'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: 'Deluxe Room',
        description: 'Well-appointed deluxe room with premium furnishings and enhanced amenities',
        capacity: 2,
        base_price: 78000.00,
        bed_type: 'queen',
        number_of_beds: 1,
        size: 32,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Flat-screen TV',
          'Mini Bar',
          'Work Desk',
          'Private Bathroom',
          'Premium Toiletries',
          'Bathrobes'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: uuidv4(),
        name: 'Executive Room',
        description: 'Premium executive room designed for business travelers with additional amenities',
        capacity: 2,
        base_price: 95000.00,
        bed_type: 'king',
        number_of_beds: 1,
        size: 40,
        amenities: JSON.stringify([
          'WiFi',
          'Air Conditioning',
          'Smart TV',
          'Mini Bar',
          'Executive Work Desk',
          'Private Bathroom',
          'Premium Toiletries',
          'Bathrobes',
          'Coffee/Tea Maker',
          'Complimentary Newspaper'
        ]),
        images: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ], {});
  },

  async down(queryInterface) {
    // Delete all room types on rollback
    await queryInterface.sequelize.query('TRUNCATE TABLE room_types CASCADE;');
  }
};
