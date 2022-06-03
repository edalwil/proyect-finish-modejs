const { db } = require('../utils/database');
const { DataTypes } = require('sequelize');

const Categories = db.define('category', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "active"
  },
});

module.exports = { Categories };
