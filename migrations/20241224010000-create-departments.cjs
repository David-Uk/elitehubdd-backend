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

    const safeAddIndex = async (table, columns, options) => {
        try {
            await queryInterface.addIndex(table, columns, options);
        } catch (e) {
            if (!e.message.includes('already exists')) throw e;
            console.log(`Index on ${table} already exists, skipping.`);
        }
    };

    const safeAddColumn = async (table, column, options) => {
        try {
            await queryInterface.addColumn(table, column, options);
        } catch (e) {
            if (!e.message.includes('already exists')) throw e;
            console.log(`Column ${column} on ${table} already exists, skipping.`);
        }
    };

    // Create departments table
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
        unique: true,
        comment: 'Unique code for the department (e.g., reception, housekeeping)'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      head_of_department: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Staff member who heads this department'
      },
      budget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Annual budget allocated to this department'
      },
      contact_email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      contact_phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await safeAddIndex('departments', ['name'], { unique: true });
    await safeAddIndex('departments', ['code'], { unique: true });
    await safeAddIndex('departments', ['status']);
    await safeAddIndex('departments', ['head_of_department']);

    // Insert default departments based on existing enum values
    try {
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
        ]); } catch (e) { console.log('bulkInsert skipped in 20241224010000-create-departments.cjs:', e.message); }
    } catch (e) {
        console.log('Default departments probably exist, skipping bulkInsert.');
    }

    // Add department_id column to staff table
    await safeAddColumn('staff', 'department_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrate existing department enum values to department_id
    // This requires a custom query to map enum values to department IDs
    const departments = await queryInterface.sequelize.query(
      'SELECT id, code FROM departments',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const dept of departments) {
      await queryInterface.sequelize.query(
        `UPDATE staff SET department_id = '${dept.id}' WHERE department = '${dept.code}'`
      );
    }

    // Add index for department_id in staff table
    await safeAddIndex('staff', ['department_id']);

    // Add department_id column to inventory_allocations table
    await safeAddColumn('inventory_allocations', 'department_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Migrate existing department enum values to department_id in inventory_allocations
    for (const dept of departments) {
      await queryInterface.sequelize.query(
        `UPDATE inventory_allocations SET department_id = '${dept.id}' WHERE department = '${dept.code}'`
      );
    }

    // Add index for department_id in inventory_allocations table
    await safeAddIndex('inventory_allocations', ['department_id']);
  },

  async down(queryInterface) {
    // Remove indexes
    await queryInterface.removeIndex('inventory_allocations', ['department_id']);
    await queryInterface.removeIndex('staff', ['department_id']);
    
    // Remove columns
    await queryInterface.removeColumn('inventory_allocations', 'department_id');
    await queryInterface.removeColumn('staff', 'department_id');
    
    // Drop departments table
    await queryInterface.dropTable('departments');
  }
};
