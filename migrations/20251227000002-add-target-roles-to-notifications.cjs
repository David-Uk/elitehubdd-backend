'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('notifications', 'target_roles', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: false,
      comment: 'List of roles that can view this notification'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notifications', 'target_roles');
  }
};
