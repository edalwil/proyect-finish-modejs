//models
const { User } = require('./user.model');
const { Carts } = require('./carts.models');
const { Categories } = require('./categories.models');
const { Orders } = require('./orders.models');
const { ProductImgs } = require('./productImgs.models');
const { Products } = require('./products.models');
const { ProductsInCart } = require('./productsInCart.models');

// Establish your models relations inside this function
const initModels = () => {
  //1 usuario muchos productos
  User.hasMany(Products);
  Products.belongsTo(User);

  //1 usuario muchas ordenes
  User.hasMany(Orders);
  Orders.belongsTo(User);

  //1 usuario 1 carrito
  User.hasOne(Carts);
  Carts.belongsTo(User);

  //1 products muchas imagenes
  Products.hasMany(ProductImgs);
  Products.belongsTo(Products);

  //1 categoria 1 producto
  Categories.hasOne(Products);
  Products.belongsTo(Categories);

  //1 carrito muchas productos en el carrito
  Carts.hasMany(ProductsInCart);
  ProductsInCart.belongsTo(Carts);

  //1 producto 1 producto en el carrito
  Products.hasOne(ProductsInCart);
  ProductsInCart.belongsTo(Products);

  //1 carrito 1 orden
  Carts.hasMany(Orders);
  Orders.belongsTo(Carts);
};

module.exports = { initModels };
