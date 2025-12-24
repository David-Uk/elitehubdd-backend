'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    const safeCreateTable = async (table, attr, options = {}) => {
      try {
        await queryInterface.createTable(table, attr, { ...options, ifNotExists: true });
      } catch (e) {
        if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e;
        console.log(`Table ${table} already exists, skipping.`);
      }
    };

    await safeCreateTable('notifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: 'info',
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
      }
    });

    try {
      await queryInterface.addIndex('notifications', ['user_id']);
      await queryInterface.addIndex('notifications', ['staff_id']);
      await queryInterface.addIndex('notifications', ['action']);
      await queryInterface.addIndex('notifications', ['type']);
    } catch (err) {
      console.log('Indexes on notifications might already exist.');
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  }
};
