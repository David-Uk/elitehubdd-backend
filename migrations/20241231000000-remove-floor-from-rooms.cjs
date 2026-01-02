'use strict';

module.exports = {
  async up(queryInterface) {
    try {
      // Remove floor column from rooms table
      await queryInterface.removeColumn('rooms', 'floor');
      
      console.log('✅ Floor column removed from rooms table');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  Floor column does not exist in rooms table - skipping');
      } else {
        console.error('❌ Error removing floor column:', error.message);
        throw error;
      }
    }
  },

  async down(queryInterface) {
    try {
      // Add floor column back to rooms table
      await queryInterface.addColumn('rooms', 'floor', {
        type: 'INTEGER',
        allowNull: false,
        defaultValue: 1
      });
      
      console.log('✅ Floor column added back to rooms table');
    } catch (error) {
      console.error('❌ Error adding floor column:', error.message);
      throw error;
    }
  }
};
