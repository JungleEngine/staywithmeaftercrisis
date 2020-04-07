
const Sequelize = require('sequelize');

const sequelize = require('./init');

const user = sequelize.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  name: {
    type: Sequelize.STRING,
  },
  facebook_url: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  facebook_token: {
    allowNull: true,
    type: Sequelize.STRING,
  },
}, {
  freezeTableName: true,
  underscored: true,
});

module.exports = user;
