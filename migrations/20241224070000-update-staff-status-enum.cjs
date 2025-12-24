'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSQL doesn't allow adding values to ENUMs easily via Sequelize.query
    // We can use raw SQL to add the values if the type exists.
    // However, the previous migration used DataTypes.ENUM which creates an anonymous enum type if not named.
    // For safer updates, we can change the column type to string temporarily or add values to the existing type.
    
    try {
      // Add new enum values to the staff_status_enum or equivalent
      // In PostgreSQL, we can add values one by one.
      await queryInterface.sequelize.query("ALTER TYPE enum_staff_status ADD VALUE IF NOT EXISTS 'on leave'");
      await queryInterface.sequelize.query("ALTER TYPE enum_staff_status ADD VALUE IF NOT EXISTS 'retired'");
      await queryInterface.sequelize.query("ALTER TYPE enum_staff_status ADD VALUE IF NOT EXISTS 'retrenched'");
    } catch (error) {
      console.log('Error updating enum via ALTER TYPE, might be using a different name or dialect:', error.message);
      // Fallback: If it's not a named enum or name differs, we might need a different approach.
      // But usually Sequelize names them enum_TableName_ColumnName
    }
  },

  async down(queryInterface, Sequelize) {
    // Note: removing enum values is not supported in Postgres without recreating the type
    // We will leave them as is for safety.
  }
};
