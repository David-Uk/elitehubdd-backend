'use strict';

const { DataTypes } = require('sequelize');

const safeCreateTable = async (queryInterface, tableName, columns) => {
  try {
    await queryInterface.describeTable(tableName);
    console.log(`Table ${tableName} already exists`);
  } catch {
    // Table doesn't exist, create it
    await queryInterface.createTable(tableName, columns);
    console.log(`Created table ${tableName}`);
  }
};

const safeAddIndex = async (queryInterface, tableName, indexFields, options = {}) => {
  try {
    await queryInterface.addIndex(tableName, { fields: indexFields, ...options });
    console.log(`Added index on ${indexFields.join(', ')} to table ${tableName}`);
  } catch (error) {
    console.log(`Index on ${indexFields.join(', ')} already exists or error:`, error.message);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Create batch_sources table
      await safeCreateTable(queryInterface, 'batch_sources', {
        id: { 
          type: DataTypes.UUID, 
          defaultValue: DataTypes.UUIDV4, 
          primaryKey: true 
        },
        batch_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'order_batches', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        source_id: {
          type: DataTypes.STRING,
          allowNull: false
        },
        source_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        source_type: {
          type: DataTypes.ENUM('room', 'table', 'facility'),
          allowNull: false
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        created_at: { 
          allowNull: false, 
          type: DataTypes.DATE, 
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
        },
        updated_at: { 
          allowNull: false, 
          type: DataTypes.DATE, 
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
        },
        deleted_at: { 
          type: DataTypes.DATE 
        }
      });

      // Add indexes for batch_sources
      await safeAddIndex(queryInterface, 'batch_sources', ['batch_id']);
      await safeAddIndex(queryInterface, 'batch_sources', ['source_type']);
      await safeAddIndex(queryInterface, 'batch_sources', ['source_id']);

      console.log('Migration completed successfully: Created batch_sources table');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      // Drop batch_sources table
      await queryInterface.dropTable('batch_sources', { cascade: true });
      console.log('Dropped batch_sources table');
      console.log('Migration rollback completed successfully');
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
