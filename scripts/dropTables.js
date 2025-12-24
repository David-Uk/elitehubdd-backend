import db from './models/index.js';

async function dropAllTables() {
  try {
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Database User:', process.env.DB_USER);
    console.log('Database Name:', process.env.DB_NAME);
    
    console.log('Dropping all tables...');
    await db.sequelize.drop();
    console.log('All tables dropped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropAllTables();
