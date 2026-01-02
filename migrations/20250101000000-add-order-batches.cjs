'use strict';

const { DataTypes } = require('sequelize');

const safeCreateTable = async (queryInterface, tableName, columns) => {
  try {
    await queryInterface.describeTable(tableName);
    console.log(`Table ${tableName} already exists`);
  } catch {
    // Table doesn't exist, create it
    await queryInterface.createTable(tableName, columns);
  }
};

const safeAddColumn = async (queryInterface, tableName, columnName, columnDefinition) => {
  try {
    await queryInterface.describeTable(tableName);
    const columns = await queryInterface.describeTable(tableName);
    if (!columns[columnName]) {
      await queryInterface.addColumn(tableName, columnName, columnDefinition);
    }
  } catch {
    console.log(`Table ${tableName} does not exist or column ${columnName} already exists`);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add order_batches table
      await safeCreateTable(queryInterface, 'order_batches', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        batch_id: { type: DataTypes.STRING, allowNull: false, unique: true },
        staff_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'staff', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        status: {
          type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
          defaultValue: 'pending',
          allowNull: false
        },
        total_items: { type: DataTypes.INTEGER, defaultValue: 0 },
        total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        service_charge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        notes: { type: DataTypes.TEXT },
        completed_at: { type: DataTypes.DATE },
        created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        deleted_at: { type: DataTypes.DATE }
      });

      // Add indexes for order_batches
      await queryInterface.addIndex('order_batches', { fields: ['batch_id'], unique: true });
      await queryInterface.addIndex('order_batches', { fields: ['staff_id'] });
      await queryInterface.addIndex('order_batches', { fields: ['status'] });
      await queryInterface.addIndex('order_batches', { fields: ['created_at'] });
      await queryInterface.addIndex('order_batches', { fields: ['status', 'created_at'] });

      // Add batch_id column to restaurant_orders table
      await safeAddColumn(queryInterface, 'restaurant_orders', 'batch_id', {
        type: DataTypes.UUID,
        references: { model: 'order_batches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      });

      // Add index for batch_id in restaurant_orders
      try {
        await queryInterface.addIndex('restaurant_orders', { fields: ['batch_id'] });
      } catch (error) {
        console.log('Index on batch_id already exists or error:', error.message);
      }

    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      // Remove batch_id column from restaurant_orders
      const columns = await queryInterface.describeTable('restaurant_orders');
      if (columns.batch_id) {
        await queryInterface.removeColumn('restaurant_orders', 'batch_id');
      }

      // Drop order_batches table
      await queryInterface.dropTable('order_batches', { cascade: true });
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
