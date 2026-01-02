'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Add notes column to guests table
    try {
      await queryInterface.addColumn('guests', 'notes', {
        type: 'TEXT',
        allowNull: true
      });
      console.log('Added notes column to guests table');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('Notes column already exists in guests table');
    }
  },

  async down(queryInterface) {
    // Remove notes column from guests table
    try {
      await queryInterface.removeColumn('guests', 'notes');
      console.log('Removed notes column from guests table');
    } catch (error) {
      if (!error.message.includes('does not exist')) {
        throw error;
      }
      console.log('Notes column does not exist in guests table');
    }
  }
};
