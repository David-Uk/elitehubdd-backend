'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add new roles to enum
      const roles = ['accountant', 'supervisor', 'waiter', 'kitchen_staff'];
      for (const role of roles) {
        await queryInterface.sequelize.query(`ALTER TYPE enum_staff_role ADD VALUE IF NOT EXISTS '${role}'`);
      }
    } catch (error) {
      console.log('Error updating enum via ALTER TYPE.', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Enum rollback not supported
  }
};
