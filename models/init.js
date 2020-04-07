const Sequelize = require('sequelize');
const envProvider = require('../env_provider');

const sequelize = new Sequelize(envProvider.DB_DATABASE,
    envProvider.DB_USERNAME, envProvider.DB_PASSWORD, {
      host: envProvider.DB_HOST,
      port: envProvider.DB_PORT,
      dialect: 'mysql',
      dialectOptions: {
        insecureAuth: true,
      },
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
      logging: false,
    });
sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });
module.exports = sequelize;
