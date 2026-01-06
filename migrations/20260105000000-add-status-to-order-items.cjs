'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists first
    const tableInfo = await queryInterface.describeTable('restaurant_order_items');
    
    if (!tableInfo.status) {
      await queryInterface.addColumn('restaurant_order_items', 'status', {
        type: Sequelize.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      });
    }

    // Also add indexes for performance
    if (!tableInfo.status) { // Only if we just added it, or check index existence separately but this is simple enough for now
       await queryInterface.addIndex('restaurant_order_items', ['status']);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('restaurant_order_items');
    if (tableInfo.status) {
      await queryInterface.removeColumn('restaurant_order_items', 'status');
      // ENUM types often persist in Postgres, explicit drop might be needed depending on dialect, 
      // but removeColumn usually handles the column itself.
    }
  }
};
