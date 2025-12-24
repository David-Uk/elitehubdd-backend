'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const safeCreateTable = async (table, attr, options = {}) => {
        try {
            await queryInterface.createTable(table, attr, { ...options, ifNotExists: true });
        } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e;
            console.log(`Table ${table} already exists, skipping.`);
        }
    };

    const { DataTypes } = Sequelize;

    // Helper for safe table/index creation
    const safeAddIndex = async (table, columns, options) => {
        try {
            await queryInterface.addIndex(table, columns, options);
        } catch (e) {
            if (!e.message.includes('already exists')) throw e;
            console.log(`Index on ${table} already exists, skipping.`);
        }
    };

    // Create inventory_allocations table
    await safeCreateTable('inventory_allocations', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      department: {
        type: DataTypes.ENUM('reception', 'housekeeping', 'maintenance', 'management', 'restaurant'),
        allowNull: false
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE, allowNull: true }
    });

    await safeAddIndex('inventory_allocations', ['item_id']);
    await safeAddIndex('inventory_allocations', ['department']);
    await safeAddIndex('inventory_allocations', ['created_at']);

    // Create inventory_additions table
    await safeCreateTable('inventory_additions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      supplier: { type: DataTypes.STRING, allowNull: true },
      batch_number: { type: DataTypes.STRING, allowNull: true },
      expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE, allowNull: true }
    });

    await safeAddIndex('inventory_additions', ['item_id']);
    await safeAddIndex('inventory_additions', ['created_at']);
    await safeAddIndex('inventory_additions', ['batch_number']);

    // Create inventory_subtractions table
    await safeCreateTable('inventory_subtractions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      subtraction_cause: {
        type: DataTypes.ENUM('damaged', 'expired', 'lost', 'stolen', 'returned', 'wastage', 'other'),
        allowNull: false
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE, allowNull: true }
    });

    await safeAddIndex('inventory_subtractions', ['item_id']);
    await safeAddIndex('inventory_subtractions', ['subtraction_cause']);
    await safeAddIndex('inventory_subtractions', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_subtractions');
    await queryInterface.dropTable('inventory_additions');
    await queryInterface.dropTable('inventory_allocations');
  }
};
