import { DataTypes } from 'sequelize';
import db from './models/index.js';

async function runMigrations() {
  try {
    console.log('Running batch sources migrations...');
    
    const queryInterface = db.sequelize.getQueryInterface();
    
    // Step 1: Create batch_sources table
    console.log('Step 1: Creating batch_sources table...');
    
    try {
      await queryInterface.describeTable('batch_sources');
      console.log('batch_sources table already exists');
    } catch {
      // Table doesn't exist, create it
      await queryInterface.createTable('batch_sources', {
        id: { 
          type: DataTypes.UUID, 
          defaultValue: DataTypes.UUIDV4, 
          primaryKey: true 
        },
        batch_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'order_batches', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        source_id: {
          type: DataTypes.STRING,
          allowNull: false
        },
        source_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        source_type: {
          type: DataTypes.ENUM('room', 'table', 'facility'),
          allowNull: false
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        created_at: { 
          allowNull: false, 
          type: DataTypes.DATE
        },
        updated_at: { 
          allowNull: false, 
          type: DataTypes.DATE
        },
        deleted_at: { 
          type: DataTypes.DATE
        }
      });
      
      console.log('batch_sources table created successfully');
      
      // Add indexes
      await queryInterface.addIndex('batch_sources', { fields: ['batch_id'] });
      await queryInterface.addIndex('batch_sources', { fields: ['source_type'] });
      await queryInterface.addIndex('batch_sources', { fields: ['source_id'] });
      
      console.log('Indexes added to batch_sources table');
    }
    
    // Step 2: Add batch_source_id column to restaurant_orders
    console.log('Step 2: Adding batch_source_id column to restaurant_orders...');
    
    const tableDescription = await queryInterface.describeTable('restaurant_orders');
    console.log('Current columns in restaurant_orders:', Object.keys(tableDescription));
    
    if (tableDescription.batch_source_id) {
      console.log('batch_source_id column already exists in restaurant_orders');
    } else {
      await queryInterface.addColumn('restaurant_orders', 'batch_source_id', {
        type: DataTypes.UUID,
        references: { model: 'batch_sources', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      });
      
      console.log('batch_source_id column added to restaurant_orders');
      
      // Add index
      try {
        await queryInterface.addIndex('restaurant_orders', { fields: ['batch_source_id'] });
        console.log('Index on batch_source_id added to restaurant_orders');
      } catch (indexError) {
        console.log('Index already exists or error:', indexError.message);
      }
    }
    
    // Step 3: Verify the setup
    console.log('Step 3: Verifying the setup...');
    
    const batchSourcesTable = await queryInterface.describeTable('batch_sources');
    console.log('batch_sources table columns:', Object.keys(batchSourcesTable));
    
    const restaurantOrdersTable = await queryInterface.describeTable('restaurant_orders');
    console.log('restaurant_orders table columns:', Object.keys(restaurantOrdersTable));
    
    console.log('All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.original) {
      console.error('Original error:', error.original);
    }
  } finally {
    process.exit(0);
  }
}

runMigrations();
