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

    // 1. Inventory Stock Table
    await safeCreateTable('inventory_stocks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      inventory_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'inventory_items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      batch_number: {
        type: DataTypes.STRING
      },
      date_received: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      quantity_received: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      quantity_allocated: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      date_allocated: {
        type: DataTypes.DATE
      },
      available_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      in_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      expiry_date: {
        type: DataTypes.DATEONLY
      },
      supplier: {
        type: DataTypes.STRING
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

    // 2. Reservations Table
    await safeCreateTable('reservations', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      reservation_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      guest_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'guests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      staff_id: {
        type: DataTypes.UUID,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      actual_check_in: {
        type: DataTypes.DATE
      },
      actual_check_out: {
        type: DataTypes.DATE
      },
      number_of_guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'),
        defaultValue: 'pending',
        allowNull: false
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
        defaultValue: 'pending'
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'mobile_money')
      },
      special_requests: {
        type: DataTypes.TEXT
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

    // 3. Inventory Allocations Table
    await safeCreateTable('inventory_allocations', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'inventory_items',
          key: 'id'
        }
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
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

    // Add remaining indexes
    await safeAddIndex('inventory_stocks', ['inventory_item_id']);
    await safeAddIndex('reservations', ['guest_id']);
    await safeAddIndex('reservations', ['room_id']);
    await safeAddIndex('inventory_allocations', ['item_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inventory_allocations');
    await queryInterface.dropTable('reservations');
    await queryInterface.dropTable('inventory_stocks');
  }
};
