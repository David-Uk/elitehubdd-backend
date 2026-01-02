import { DataTypes } from 'sequelize';
import db from './models/index.js';

async function runMigration() {
  try {
    console.log('Running migration to add batch_source_id column...');
    
    const queryInterface = db.sequelize.getQueryInterface();
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('restaurant_orders');
    console.log('Current columns in restaurant_orders:', Object.keys(tableDescription));
    
    if (tableDescription.batch_source_id) {
      console.log('batch_source_id column already exists');
    } else {
      console.log('Adding batch_source_id column...');
      
      // Add the column
      await queryInterface.addColumn('restaurant_orders', 'batch_source_id', {
        type: DataTypes.UUID,
        references: { model: 'batch_sources', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      });
      
      console.log('batch_source_id column added successfully');
      
      // Add index
      try {
        await queryInterface.addIndex('restaurant_orders', { fields: ['batch_source_id'] });
        console.log('Index on batch_source_id added successfully');
      } catch (indexError) {
        console.log('Index already exists or error:', indexError.message);
      }
    }
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
