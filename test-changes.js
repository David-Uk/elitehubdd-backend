const { sequelize } = require('./models/index.js');

async function checkChanges() {
  try {
    console.log('🔍 Checking Room model changes...\n');
    
    // Check rooms table structure
    const [roomColumns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'rooms' 
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('📋 Rooms table columns:');
    roomColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check if floor column exists
    const hasFloor = roomColumns.some(col => col.COLUMN_NAME === 'floor');
    console.log(`\n✅ Floor column removed: ${!hasFloor ? 'YES' : 'NO'}`);
    
    // Check room types and prices
    const [roomTypes] = await sequelize.query(`
      SELECT name, base_price, capacity 
      FROM room_types 
      ORDER BY name
    `);
    
    console.log('\n🏨 Room types and prices:');
    roomTypes.forEach(type => {
      console.log(`  - ${type.name}: ₦${type.base_price.toLocaleString()} (capacity: ${type.capacity})`);
    });
    
    console.log('\n🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkChanges();
