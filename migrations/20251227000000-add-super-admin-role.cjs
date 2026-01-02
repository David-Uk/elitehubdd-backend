'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add 'super_admin' to the enum_staff_role type
      await queryInterface.sequelize.query("ALTER TYPE enum_staff_role ADD VALUE IF NOT EXISTS 'super_admin' BEFORE 'admin'");
    } catch (error) {
      console.log('Error updating enum via ALTER TYPE. It might be that the type name is different or the dialect is not Postgres.', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Removing enum values is complex in Postgres, skipping for now as it's a non-destructive operation usuallly
  }
};
