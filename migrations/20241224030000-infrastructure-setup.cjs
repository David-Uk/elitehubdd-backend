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

    // 1. RoomTypes Table
    await safeCreateTable('room_types', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      amenities: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      bed_type: {
        type: DataTypes.ENUM('single', 'double', 'queen', 'king', 'twin')
      },
      number_of_beds: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      size: {
        type: DataTypes.INTEGER
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: []
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

    // 2. Rooms Table
    await safeCreateTable('rooms', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      room_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      room_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'room_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved'),
        defaultValue: 'available',
        allowNull: false
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      notes: {
        type: DataTypes.TEXT
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

    // 3. Guests Table
    await safeCreateTable('guests', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT
      },
      city: {
        type: DataTypes.STRING
      },
      country: {
        type: DataTypes.STRING
      },
      id_type: {
        type: DataTypes.ENUM('passport', 'drivers_license', 'national_id'),
        allowNull: false
      },
      id_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      date_of_birth: {
        type: DataTypes.DATEONLY
      },
      nationality: {
        type: DataTypes.STRING
      },
      preferences: {
        type: DataTypes.JSON,
        defaultValue: {}
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

    // 4. InventoryItems Table
    await safeCreateTable('inventory_items', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      sku: {
        type: DataTypes.STRING,
        unique: true
      },
      unit: {
        type: DataTypes.STRING,
        defaultValue: 'pcs'
      },
      reorder_level: {
        type: DataTypes.INTEGER,
        defaultValue: 10
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

    // Add indexes for all tables
    await safeAddIndex('rooms', ['room_number']);
    await safeAddIndex('rooms', ['room_type_id']);
    await safeAddIndex('guests', ['email']);
    await safeAddIndex('inventory_items', ['name']);
    await safeAddIndex('inventory_items', ['sku']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_items');
    await queryInterface.dropTable('guests');
    await queryInterface.dropTable('rooms');
    await queryInterface.dropTable('room_types');
  }
};
