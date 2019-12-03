const Sequelize = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:5432/${process.env.DATABASE}`
);

module.exports = sequelize;
