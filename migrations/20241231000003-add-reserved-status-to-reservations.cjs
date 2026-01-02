'use strict';

module.exports = {
  async up(queryInterface) {
    try {
      // First, update all existing reservations that might have invalid status
      await queryInterface.sequelize.query(`
        UPDATE reservations 
        SET status = 'confirmed' 
        WHERE status NOT IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')
      `);

      // Alter the enum to include 'reserved' status
      await queryInterface.sequelize.query(`
        ALTER TABLE reservations 
        ALTER COLUMN status TYPE VARCHAR(20)
      `);

      // Update the enum constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE reservations 
        ADD CONSTRAINT enum_reservations_status 
        CHECK (status IN ('pending', 'confirmed', 'reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show'))
      `);

      console.log('✅ Reservation status enum updated to include "reserved"');
    } catch (error) {
      console.error('❌ Error updating reservation status enum:', error.message);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      // Update any 'reserved' reservations to 'confirmed' before removing enum value
      await queryInterface.sequelize.query(`
        UPDATE reservations 
        SET status = 'confirmed' 
        WHERE status = 'reserved'
      `);

      // Remove the enum constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE reservations 
        DROP CONSTRAINT IF EXISTS enum_reservations_status
      `);

      // Re-add the old enum constraint without 'reserved'
      await queryInterface.sequelize.query(`
        ALTER TABLE reservations 
        ADD CONSTRAINT enum_reservations_status 
        CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'))
      `);

      console.log('✅ Reservation status enum reverted (removed "reserved")');
    } catch (error) {
      console.error('❌ Error reverting reservation status enum:', error.message);
      throw error;
    }
  }
};
