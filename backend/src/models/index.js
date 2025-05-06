const { Sequelize } = require('sequelize');
const config = require('../../config/config'); // Fixed path

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'postgres',
    logging: console.log
  }
);

// Model imports
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Video = require('./video')(sequelize, Sequelize.DataTypes);

// Set up associations
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Ensure tables are synced
    console.log('Database connected and synced!');
  } catch (error) {
    console.error('Connection error:', error);
  }
})();

module.exports = {
  sequelize,
  ...sequelize.models // Export all models
};