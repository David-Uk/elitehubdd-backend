"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    try {
      // Ensure all expected staff roles exist in the Postgres enum
      const roles = [
        'super_admin',
        'admin',
        'accountant',
        'supervisor',
        'manager',
        'receptionist',
        'housekeeping',
        'restaurant_staff',
        'bar_staff',
        'waiter',
        'kitchen_staff',
        'maintenance'
      ];

      for (const role of roles) {
        // Use IF NOT EXISTS where supported
        try {
          await queryInterface.sequelize.query(`ALTER TYPE enum_staff_role ADD VALUE IF NOT EXISTS '${role}'`);
        } catch {
          // Some Postgres versions do not support IF NOT EXISTS in ALTER TYPE; try without it
          try {
            await queryInterface.sequelize.query(`ALTER TYPE enum_staff_role ADD VALUE '${role}'`);
          } catch (innerErr) {
            // If the value already exists or the DB dialect is not Postgres, ignore and continue
            console.log(`Skipping adding role ${role}:`, innerErr && innerErr.message ? innerErr.message : innerErr);
          }
        }
      }
    } catch (error) {
      console.log('Error updating enum_staff_role:', error && error.message ? error.message : error);
    }
  },

  async down() {
    // Removing enum values in Postgres requires creating a new enum type and migrating data.
    // It's unsafe to attempt automatically; skipping rollback.
  }
};
