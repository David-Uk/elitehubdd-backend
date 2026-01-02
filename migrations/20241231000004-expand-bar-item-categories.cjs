'use strict';

module.exports = {
  up: async (queryInterface) => {
    // First, check if the enum type exists
    const enumTypeName = 'enum_bar_items_category';
    
    try {
      // Get current enum values
      const [existingEnum] = await queryInterface.sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = '${enumTypeName}'
        )
        ORDER BY enumlabel;
      `);

      const currentValues = existingEnum.map(row => row.enumlabel);
      
      // New values to add
      const newValues = ['mocktail', 'shake', 'smoke'];
      
      // Values that need to be added (don't exist already)
      const valuesToAdd = newValues.filter(value => !currentValues.includes(value));
      
      if (valuesToAdd.length > 0) {
        // Add new enum values
        for (const value of valuesToAdd) {
          await queryInterface.sequelize.query(`
            ALTER TYPE ${enumTypeName} ADD VALUE '${value}';
          `);
        }
      }
      
      console.log(`✅ Added bar item categories: ${valuesToAdd.join(', ')}`);
      
    } catch {
      // If enum doesn't exist, we'll handle it in the down migration
      console.log('⚠️  Enum type not found, creating new enum...');
      
      // Create the enum with all values
      await queryInterface.sequelize.query(`
        CREATE TYPE ${enumTypeName} AS ENUM (
          'beer',
          'wine',
          'spirits',
          'cocktail',
          'mocktail',
          'shake',
          'soft_drink',
          'juice',
          'water',
          'smoke',
          'other'
        );
      `);
    }
  },

  down: async (queryInterface) => {
    const enumTypeName = 'enum_bar_items_category';
    
    try {
      // Get current enum values
      const [existingEnum] = await queryInterface.sequelize.query(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type WHERE typname = '${enumTypeName}'
        )
        ORDER BY enumlabel;
      `);

      const currentValues = existingEnum.map(row => row.enumlabel);
      
      // Values to remove
      const valuesToRemove = ['mocktail', 'shake', 'smoke'];
      
      // Values that exist and need to be removed
      const existingValuesToRemove = valuesToRemove.filter(value => currentValues.includes(value));
      
      if (existingValuesToRemove.length > 0) {
        // For PostgreSQL, we need to recreate the enum without the values to remove
        const remainingValues = currentValues.filter(value => !existingValuesToRemove.includes(value));
        
        // Create new enum type
        const tempEnumName = `${enumTypeName}_temp`;
        await queryInterface.sequelize.query(`
          CREATE TYPE ${tempEnumName} AS ENUM (${remainingValues.map(v => `'${v}'`).join(', ')});
        `);
        
        // Update column to use new enum
        await queryInterface.sequelize.query(`
          ALTER TABLE bar_items ALTER COLUMN category TYPE ${tempEnumName} 
          USING category::text::${tempEnumName};
        `);
        
        // Drop old enum
        await queryInterface.sequelize.query(`DROP TYPE ${enumTypeName};`);
        
        // Rename temp enum to original name
        await queryInterface.sequelize.query(`ALTER TYPE ${tempEnumName} RENAME TO ${enumTypeName};`);
        
        console.log(`✅ Removed bar item categories: ${existingValuesToRemove.join(', ')}`);
      }
      
    } catch (rollbackError) {
      console.log('❌ Error removing enum values:', rollbackError.message);
      throw rollbackError;
    }
  }
};
