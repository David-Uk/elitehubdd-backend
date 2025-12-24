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

    // 1. Create Users Table
    await safeCreateTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'moderator'),
        defaultValue: 'user'
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

    // 2. Create Departments Table
    await safeCreateTable('departments', {
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
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      head_of_department: {
        type: DataTypes.UUID,
        allowNull: true
        // Reference added later after Staff table exists
      },
      budget: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
      },
      contact_email: {
        type: DataTypes.STRING
      },
      contact_phone: {
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

    // 3. Create Staff Table
    await safeCreateTable('staff', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.ENUM(
          'admin',
          'manager',
          'receptionist',
          'housekeeping',
          'restaurant_staff',
          'bar_staff',
          'maintenance'
        ),
        defaultValue: 'receptionist',
        allowNull: false
      },
      department: {
        type: DataTypes.ENUM(
          'reception',
          'housekeeping',
          'maintenance',
          'management',
          'restaurant'
        ),
        allowNull: true
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      position: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'disabled'),
        defaultValue: 'active',
        allowNull: false
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT
      },
      hire_date: {
        type: DataTypes.DATEONLY
      },
      last_login: {
        type: DataTypes.DATE
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

    // 4. Add Head of Department reference back to Departments table
    await safeAddConstraint('departments', {
      fields: ['head_of_department'],
      type: 'foreign key',
      name: 'departments_head_of_department_fkey',
      references: {
        table: 'staff',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Seeds
    try { await queryInterface.bulkInsert('departments', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Reception',
        code: 'reception',
        description: 'Front desk and guest services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Housekeeping',
        code: 'housekeeping',
        description: 'Room cleaning and maintenance services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Maintenance',
        code: 'maintenance',
        description: 'Facility and equipment maintenance',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Management',
        code: 'management',
        description: 'Executive and administrative management',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Restaurant',
        code: 'restaurant',
        description: 'Food and beverage services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]); } catch (e) { console.log('bulkInsert skipped in 20241224020000-core-setup.cjs:', e.message); }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('staff');
    await queryInterface.dropTable('departments');
    await queryInterface.dropTable('users');
  }
};
