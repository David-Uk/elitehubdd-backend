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
        }
    };

    // 1. Staff
    await safeCreateTable('staff', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      phone_number: { type: DataTypes.STRING },
      role: { 
        type: DataTypes.ENUM('admin', 'manager', 'receptionist', 'housekeeping', 'restaurant_staff', 'bar_staff', 'maintenance'),
        allowNull: false,
        defaultValue: 'receptionist'
      },
      department: {
        type: DataTypes.ENUM('reception', 'housekeeping', 'maintenance', 'management', 'restaurant'),
        allowNull: false,
        defaultValue: 'management'
      },
      position: { type: DataTypes.STRING },
      status: { 
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'disabled'),
        defaultValue: 'active',
        allowNull: false
      },
      gender: { type: DataTypes.ENUM('male', 'female'), allowNull: false },
      address: { type: DataTypes.TEXT },
      hire_date: { type: DataTypes.DATEONLY },
      last_login: { type: DataTypes.DATE },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 2. RoomTypes
    await safeCreateTable('room_types', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      amenities: { type: DataTypes.JSON, defaultValue: [] },
      bed_type: { type: DataTypes.ENUM('single', 'double', 'queen', 'king', 'twin') },
      number_of_beds: { type: DataTypes.INTEGER, defaultValue: 1 },
      size: { type: DataTypes.INTEGER },
      images: { type: DataTypes.JSON, defaultValue: [] },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 3. Rooms
    await safeCreateTable('rooms', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      room_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      room_type_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'room_types', key: 'id' }
      },
      floor: { type: DataTypes.INTEGER, allowNull: false },
      status: { 
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved'),
        defaultValue: 'available',
        allowNull: false
      },
      features: { type: DataTypes.JSON, defaultValue: [] },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 4. Guests
    await safeCreateTable('guests', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      phone_number: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.TEXT },
      city: { type: DataTypes.STRING },
      country: { type: DataTypes.STRING },
      id_type: { type: DataTypes.ENUM('passport', 'drivers_license', 'national_id'), allowNull: false },
      id_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      date_of_birth: { type: DataTypes.DATEONLY },
      nationality: { type: DataTypes.STRING },
      preferences: { type: DataTypes.JSON, defaultValue: {} },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 5. Reservations
    await safeCreateTable('reservations', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      reservation_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      guest_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'guests', key: 'id' }
      },
      room_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'rooms', key: 'id' }
      },
      staff_id: { // Created by
        type: DataTypes.UUID,
        references: { model: 'staff', key: 'id' }
      },
      check_in_date: { type: DataTypes.DATE, allowNull: false },
      check_out_date: { type: DataTypes.DATE, allowNull: false },
      status: { 
        type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'),
        defaultValue: 'pending',
        allowNull: false
      },
      number_of_guests: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      paid_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      payment_status: { 
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      special_requests: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 6. Inventory Items
    await safeCreateTable('inventory_items', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      category: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      sku: { type: DataTypes.STRING, unique: true },
      unit: { type: DataTypes.STRING, defaultValue: 'pcs' },
      reorder_level: { type: DataTypes.INTEGER, defaultValue: 10 },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 7. Inventory Stocks
    await safeCreateTable('inventory_stocks', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      inventory_item_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'inventory_items', key: 'id' }
      },
      batch_number: { type: DataTypes.STRING },
      date_received: { type: DataTypes.DATE, allowNull: false },
      quantity_received: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      quantity_allocated: { type: DataTypes.INTEGER, defaultValue: 0 },
      date_allocated: { type: DataTypes.DATE },
      available_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
      in_stock: { type: DataTypes.BOOLEAN, defaultValue: true },
      expiry_date: { type: DataTypes.DATEONLY },
      supplier: { type: DataTypes.STRING },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 8. Menu Items
    await safeCreateTable('menu_items', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
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
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 9. Restaurant Orders
    await safeCreateTable('restaurant_orders', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      reservation_id: { 
        type: DataTypes.UUID,
        references: { model: 'reservations', key: 'id' }
      },
      staff_id: { 
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'staff', key: 'id' }
      },
      table_number: { type: DataTypes.STRING },
      order_type: { 
        type: DataTypes.ENUM('dine_in', 'room_service', 'takeaway'), 
        defaultValue: 'dine_in' 
      },
      status: { 
        type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      service_charge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      payment_status: { 
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending'
      },
      payment_method: { type: DataTypes.ENUM('cash', 'card', 'room_charge', 'mobile_money') },
      special_instructions: { type: DataTypes.TEXT },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 10. Restaurant Order Items
    await safeCreateTable('restaurant_order_items', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      order_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'restaurant_orders', key: 'id' }
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
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false }
    }, { ifNotExists: true });

    // 11. Bar Items
    await safeCreateTable('bar_items', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
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
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 12. Bar Orders
    await safeCreateTable('bar_orders', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
      reservation_id: { // Nullable, external guests
        type: DataTypes.UUID,
        references: { model: 'reservations', key: 'id' }
      },
      staff_id: { 
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'staff', key: 'id' }
      },
      table_number: { type: DataTypes.STRING },
      order_type: { 
        type: DataTypes.ENUM('bar', 'room_service'), 
        defaultValue: 'bar' 
      },
      status: { 
        type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      payment_status: { 
        type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
        defaultValue: 'pending'
      },
      payment_method: { type: DataTypes.ENUM('cash', 'card', 'room_charge', 'mobile_money') },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

    // 13. Bar Order Items
    await safeCreateTable('bar_order_items', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      order_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'bar_orders', key: 'id' }
      },
      bar_item_id: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'bar_items', key: 'id' }
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false }
    }, { ifNotExists: true });

    // 14. Feedbacks
    await safeCreateTable('feedbacks', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
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
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
      deleted_at: { type: DataTypes.DATE }
    }, { ifNotExists: true });

  },

  async down(queryInterface) {
    // Drop tables in reverse order of creation (dependent first)
    await queryInterface.dropTable('feedbacks', { cascade: true });
    await queryInterface.dropTable('bar_order_items', { cascade: true });
    await queryInterface.dropTable('bar_orders', { cascade: true });
    await queryInterface.dropTable('bar_items', { cascade: true });
    await queryInterface.dropTable('restaurant_order_items', { cascade: true });
    await queryInterface.dropTable('restaurant_orders', { cascade: true });
    await queryInterface.dropTable('menu_items', { cascade: true });
    await queryInterface.dropTable('inventory_stocks', { cascade: true });
    await queryInterface.dropTable('inventory_items', { cascade: true });
    await queryInterface.dropTable('reservations', { cascade: true });
    await queryInterface.dropTable('guests', { cascade: true });
    await queryInterface.dropTable('rooms', { cascade: true });
    await queryInterface.dropTable('room_types', { cascade: true });
    await queryInterface.dropTable('staff', { cascade: true });
  }
};
