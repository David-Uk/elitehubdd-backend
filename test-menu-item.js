import dotenv from 'dotenv';
import db from './models/index.js';

dotenv.config();

async function testMenuItemCreation() {
  try {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Testing menu item creation...');
    
    // Test if we can connect to the database
    console.log('Testing database connection...');
    await db.sequelize.authenticate();
    console.log('Database connection successful');
    
    // Test data
    const testData = {
      name: 'Test Menu Item',
      category: 'appetizer',
      price: 9.99,
      description: 'Test description'
    };

    console.log('Creating menu item with data:', testData);
    
    // Create menu item
    const menuItem = await db.MenuItem.create(testData);
    
    console.log('Created menu item:', menuItem.toJSON());
    console.log('Menu item ID:', menuItem.id);
    console.log('Test successful!');
    
    // Clean up
    await menuItem.destroy();
    console.log('Test item cleaned up');
    
  } catch (error) {
    console.error('Error creating menu item:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    process.exit(0);
  }
}

testMenuItemCreation();
