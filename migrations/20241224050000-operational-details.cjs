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

    // 1. Menu Items Table
    await safeCreateTable('menu_items', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      category: {
        type: DataTypes.ENUM('appetizer', 'main_course', 'dessert', 'beverage', 'breakfast', 'lunch', 'dinner'),
        allowNull: false
      },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      cost: { type: DataTypes.DECIMAL(10, 2) },
      preparation_time: { type: DataTypes.INTEGER },
      cuisine: { type: DataTypes.STRING },
      is_vegetarian: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_vegan: { type: DataTypes.BOOLEAN, defaultValue: false },
      allergens: { type: DataTypes.JSON, defaultValue: [] },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      product_image: { type: DataTypes.STRING },
      is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 2. Bar Items Table
    await safeCreateTable('bar_items', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      category: {
        type: DataTypes.ENUM('beer', 'wine', 'spirits', 'cocktail', 'soft_drink', 'juice', 'water', 'other'),
        allowNull: false
      },
      brand: { type: DataTypes.STRING },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      cost: { type: DataTypes.DECIMAL(10, 2) },
      volume: { type: DataTypes.STRING },
      alcohol_content: { type: DataTypes.DECIMAL(4, 2) },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      reorder_level: { type: DataTypes.INTEGER, defaultValue: 10 },
      product_image: { type: DataTypes.STRING },
      is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 3. Restaurant Orders Table
    await safeCreateTable('restaurant_orders', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      reservation_id: {
        type: DataTypes.UUID,
        references: { model: 'reservations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'staff', key: 'id' }
      },
      table_number: { type: DataTypes.STRING },
      order_type: { type: DataTypes.ENUM('dine_in', 'room_service', 'takeaway'), defaultValue: 'dine_in' },
      status: {
        type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      service_charge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      payment_status: { type: DataTypes.ENUM('pending', 'paid', 'cancelled'), defaultValue: 'pending' },
      payment_method: { type: DataTypes.ENUM('cash', 'card', 'room_charge', 'mobile_money') },
      special_instructions: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 4. Restaurant Order Items Table
    await safeCreateTable('restaurant_order_items', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'restaurant_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      menu_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'menu_items', key: 'id' }
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      special_instructions: { type: DataTypes.TEXT },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 5. Bar Orders Table
    await safeCreateTable('bar_orders', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      reservation_id: {
        type: DataTypes.UUID,
        references: { model: 'reservations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'staff', key: 'id' }
      },
      table_number: { type: DataTypes.STRING },
      order_type: { type: DataTypes.ENUM('bar', 'room_service'), defaultValue: 'bar' },
      status: {
        type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      payment_status: { type: DataTypes.ENUM('pending', 'paid', 'cancelled'), defaultValue: 'pending' },
      payment_method: { type: DataTypes.ENUM('cash', 'card', 'room_charge', 'mobile_money') },
      notes: { type: DataTypes.TEXT },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 6. Bar Order Items Table
    await safeCreateTable('bar_order_items', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'bar_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bar_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'bar_items', key: 'id' }
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 7. Inventory Additions Table
    await safeCreateTable('inventory_additions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' }
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      supplier: { type: DataTypes.STRING },
      batch_number: { type: DataTypes.STRING },
      expiry_date: { type: DataTypes.DATEONLY },
      notes: { type: DataTypes.TEXT },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 8. Inventory Subtractions Table
    await safeCreateTable('inventory_subtractions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      item_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' }
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      subtraction_cause: {
        type: DataTypes.ENUM('damaged', 'expired', 'lost', 'stolen', 'returned', 'wastage', 'other'),
        allowNull: false
      },
      notes: { type: DataTypes.TEXT },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });

    // 9. Feedbacks Table
    await safeCreateTable('feedbacks', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      guest_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'guests', key: 'id' }
      },
      reservation_id: {
        type: DataTypes.UUID,
        references: { model: 'reservations', key: 'id' }
      },
      overall_rating: { type: DataTypes.INTEGER, allowNull: false },
      cleanliness_rating: { type: DataTypes.INTEGER },
      service_rating: { type: DataTypes.INTEGER },
      facilities_rating: { type: DataTypes.INTEGER },
      value_rating: { type: DataTypes.INTEGER },
      location_rating: { type: DataTypes.INTEGER },
      comments: { type: DataTypes.TEXT },
      would_recommend: { type: DataTypes.BOOLEAN },
      status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'published', 'archived'),
        defaultValue: 'pending'
      },
      created_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: DataTypes.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feedbacks');
    await queryInterface.dropTable('inventory_subtractions');
    await queryInterface.dropTable('inventory_additions');
    await queryInterface.dropTable('bar_order_items');
    await queryInterface.dropTable('bar_orders');
    await queryInterface.dropTable('restaurant_order_items');
    await queryInterface.dropTable('restaurant_orders');
    await queryInterface.dropTable('bar_items');
    await queryInterface.dropTable('menu_items');
  }
};
