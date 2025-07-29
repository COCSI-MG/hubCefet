// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_POST || 5432),
    dialect: 'postgres',
  },
};
