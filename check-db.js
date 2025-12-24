import db from './models/index.js';

async function check() {
  try {
    const desc = await db.sequelize.getQueryInterface().describeTable('staff');
    console.log('Staff columns:', Object.keys(desc));
    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

check();
