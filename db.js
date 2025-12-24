import db from './models/index.js';

const connectDB = async () => {
  try {
    console.log('🔍 Connecting to database in environment:', process.env.NODE_ENV || 'development');
    const config = db.sequelize.options;
    console.log('🔍 Database host:', config.host);
    console.log('🔍 SSL enabled:', !!(config.dialectOptions && config.dialectOptions.ssl));
    
    await db.sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models with database
    // Already handled by migrations. Syncing can cause issues with complex PostgreSQL schemas.
    /*
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync();
      console.log('✅ All models were synchronized successfully.');
    }
    */
    
    return db.sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

export default connectDB;
