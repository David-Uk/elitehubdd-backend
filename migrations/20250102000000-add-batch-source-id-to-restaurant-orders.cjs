'use strict';

const { DataTypes } = require('sequelize');

const safeAddColumn = async (queryInterface, tableName, columnName, columnDefinition) => {
  try {
    await queryInterface.describeTable(tableName);
    const columns = await queryInterface.describeTable(tableName);
    if (!columns[columnName]) {
      await queryInterface.addColumn(tableName, columnName, columnDefinition);
      console.log(`Added column ${columnName} to table ${tableName}`);
    } else {
      console.log(`Column ${columnName} already exists in table ${tableName}`);
    }
  } catch (error) {
    console.log(`Table ${tableName} does not exist or error adding column ${columnName}:`, error.message);
  }
};

const safeAddIndex = async (queryInterface, tableName, indexFields) => {
  try {
    await queryInterface.addIndex(tableName, { fields: indexFields });
    console.log(`Added index on ${indexFields.join(', ')} to table ${tableName}`);
  } catch (error) {
    console.log(`Index on ${indexFields.join(', ')} already exists or error:`, error.message);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add batch_source_id column to restaurant_orders table
      await safeAddColumn(queryInterface, 'restaurant_orders', 'batch_source_id', {
        type: DataTypes.UUID,
        references: { model: 'batch_sources', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      });

      // Add index for batch_source_id in restaurant_orders
      await safeAddIndex(queryInterface, 'restaurant_orders', ['batch_source_id']);

      console.log('Migration completed successfully: Added batch_source_id to restaurant_orders');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      // Remove batch_source_id column from restaurant_orders
      const columns = await queryInterface.describeTable('restaurant_orders');
      if (columns.batch_source_id) {
        await queryInterface.removeColumn('restaurant_orders', 'batch_source_id');
        console.log('Removed batch_source_id column from restaurant_orders');
      }

      console.log('Migration rollback completed successfully');
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
