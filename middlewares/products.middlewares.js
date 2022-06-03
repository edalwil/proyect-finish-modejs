//models
const { Products } = require('../models/products.models');
const { Categories } = require('../models/categories.models');
const { User } = require('../models/user.model');

//utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const productsExist = catchAsync(async (req, res, next) => {
  //id del producto a buscar
  const { id } = req.params;

  // usuario logiado
  const { sessionUser } = req;

  //buscamos el producto
  const searchProduct = await Products.findOne({
    where: { id, status: 'active' },
    include: [
      {
        model: Categories,
        attributes: ['name'],
      },
      { model: User, attributes: ['userName', 'email'] },
    ],
  });

  //validamos si el producto no exite
  if (!searchProduct) {
    return next(new AppError('producto does not exist with given Id', 404));
  }

  // agreamos searchProduct a la req como un objeto
  req.products = searchProduct;
  next();
});

const protectProduct = catchAsync(async (req, res, next) => {
  //id del producto a buscar
  const { id } = req.params;

  // usuario logiado
  const { sessionUser } = req;

  //buscamos el producto
  const searchProduct = await Products.findOne({
    where: { id, status: 'active' },
  });

  //validamos si el producto no exite
  if (!searchProduct) {
    return next(new AppError('producto does not exist with given Id', 404));
  }

  //compramos los usuarios
  if (searchProduct.userId !== sessionUser.id) {
    return next(new AppError('product was not created by this user', 404));
  }

  //enviamos la respuesta
  next();
});

module.exports = { productsExist, protectProduct };
