import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import process from 'process';
import databaseConfig from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];
const db = {};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  let dbUrl = process.env[config.use_env_variable];
  
  // If SSL is disabled in config but enabled in the URL string, disable it in the URL
  if (!config.dialectOptions?.ssl && dbUrl.includes('sslmode=require')) {
    dbUrl = dbUrl.replace('sslmode=require', 'sslmode=disable');
  }
  
  sequelize = new Sequelize(dbUrl, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Dynamically import all model files
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

// Import models dynamically
for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const { default: model } = await import(`file://${modelPath}`);
  const initializedModel = model(sequelize, Sequelize.DataTypes);
  db[initializedModel.name] = initializedModel;
}

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
