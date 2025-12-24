'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@elitehub.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        username: 'janedoe',
        email: 'jane@example.com',
        password: hashedPassword,
        first_name: 'Jane',
        last_name: 'Doe',
        is_active: true,
        role: 'moderator',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
