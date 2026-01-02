'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('staff', 'password_reset_token', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('staff', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });
    // Add index for faster lookup by token
    await queryInterface.addIndex('staff', ['password_reset_token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('staff', ['password_reset_token']);
    await queryInterface.removeColumn('staff', 'password_reset_expires');
    await queryInterface.removeColumn('staff', 'password_reset_token');
  }
};
