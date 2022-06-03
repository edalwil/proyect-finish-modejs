const { db } = require('../utils/database');
const { DataTypes } = require('sequelize');

const ProductImgs = db.define('productImgs', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  //   imgURl: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //   },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
  },
});

module.exports = { ProductImgs };
