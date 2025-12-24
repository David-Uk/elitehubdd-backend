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

    const safeAddIndex = async (table, columns, options) => {
        try {
            await queryInterface.addIndex(table, columns, options);
        } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e;
            console.log(`Index on ${table} already exists, skipping.`);
        }
    };
    const safeAddColumn = async (table, column, options) => {
        try {
            await queryInterface.addColumn(table, column, options);
        } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e;
            console.log(`Column ${column} on ${table} already exists, skipping.`);
        }
    };
    const safeAddConstraint = async (table, options) => {
        try {
            await queryInterface.addConstraint(table, options);
        } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e;
            console.log(`Constraint on ${table} already exists, skipping.`);
        }
    };

    const { DataTypes } = Sequelize;

    // Helper to safely add column if it doesn't exist
    const addColumnIfNotExists = async (tableName, columnName, columnDef) => {
      try {
        const tableDescription = await queryInterface.describeTable(tableName);
        if (!tableDescription[columnName]) {
          await safeAddColumn(tableName, columnName, columnDef);
        }
      } catch (error) {
        console.warn(`Error adding column ${columnName} to ${tableName}:`, error.message);
      }
    };

    // 1. Staff - Add missing fields
    await addColumnIfNotExists('staff', 'department', {
      type: DataTypes.ENUM('reception', 'housekeeping', 'maintenance', 'management', 'restaurant'),
      allowNull: false,
      defaultValue: 'management'
    });

    await addColumnIfNotExists('staff', 'position', {
      type: DataTypes.STRING
    });

    await addColumnIfNotExists('staff', 'status', {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'disabled'),
      defaultValue: 'active',
      allowNull: false
    });

    await addColumnIfNotExists('staff', 'gender', {
      type: DataTypes.ENUM('male', 'female'),
      // Allow null initially to avoid breaking existing records, or set default?
      // User requirement was enum. Let's allowing null for migration safety or set default.
      // Setting defaultValue: 'male' is risky assumption. 
      // Better to allow null for now or update existing records later. 
      // But model says allowNull: false.
      // We'll set a temporary default or allowNull: true for now, then alter?
      // Let's set allowNull: true for the collection to succeed, checking existing data is hard.
      // Or just allowNull: true.
      allowNull: true 
    });

    await addColumnIfNotExists('staff', 'address', {
      type: DataTypes.TEXT
    });

    await addColumnIfNotExists('staff', 'hire_date', {
      type: DataTypes.DATEONLY
    });

    // 2. Menu Items
    await addColumnIfNotExists('menu_items', 'product_image', {
      type: DataTypes.STRING
    });

    // 3. Bar Items
    await addColumnIfNotExists('bar_items', 'product_image', {
      type: DataTypes.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    // We strictly won't remove columns to avoid data loss on rollback of this specific fix migration
    // unless necessary. But for completeness:
    // await queryInterface.removeColumn('staff', 'department');
    // ...
  }
};
