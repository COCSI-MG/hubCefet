// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../../../.env'),
});

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || 5432),
    dialect: 'postgres',
  },
};
