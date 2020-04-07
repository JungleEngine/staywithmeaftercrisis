const envProvider = require('../env_provider');

module.exports = {
  development: {
    username: envProvider.DB_USERNAME,
    password: envProvider.DB_PASSWORD,
    database: envProvider.DB_DATABASE,
    port: envProvider.DB_PORT,
    host: envProvider.DB_HOST,
    dialect: 'mysql',
    seederStorage: 'sequelize',
  },
  test: {
    username: envProvider.DB_USERNAME,
    password: envProvider.DB_PASSWORD,
    database: envProvider.DB_DATABASE,
    port: envProvider.DB_PORT,
    host: envProvider.DB_HOST,
    dialect: 'mysql',
    seederStorage: 'sequelize',
  },
  production: {
    username: envProvider.DB_USERNAME,
    password: envProvider.DB_PASSWORD,
    database: envProvider.DB_DATABASE,
    port: envProvider.DB_PORT,
    host: envProvider.DB_HOST,
    dialect: 'mysql',
  },
};
