require('dotenv').config('.env');

const SRV_PORT = process.env.PORT || '8090';
const SRV_HOST = process.env.HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_DATABASE = process.env.DB_DATABASE || 'swmac';
const DB_USERNAME = process.env.DB_USERNAME || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_HOST = process.env.DB_HOST || 'localhost';

const IO_PORT = process.env.IO_PORT || '3000';

module.exports = {
  SRV_PORT,
  SRV_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  IO_PORT,
};
