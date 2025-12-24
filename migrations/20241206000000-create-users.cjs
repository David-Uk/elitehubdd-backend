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

    // Create table if not exists
    await safeCreateTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      first_name: { type: Sequelize.STRING, allowNull: true },
      last_name: { type: Sequelize.STRING, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      role: { type: Sequelize.ENUM('user', 'admin', 'moderator'), defaultValue: 'user' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });

    // Add indexes safely
    try {
      await safeAddIndex('users', ['email'], {
        unique: true,
        name: 'users_email_unique'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
      console.log('Index users_email_unique already exists, skipping.');
    }

    try {
      await safeAddIndex('users', ['username'], {
        unique: true,
        name: 'users_username_unique'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
      console.log('Index users_username_unique already exists, skipping.');
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
