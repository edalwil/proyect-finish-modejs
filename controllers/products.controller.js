//models
const { Products } = require('../models/products.models');
const { Categories } = require('../models/categories.models');

//utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

//crear productos
const createProduct = catchAsync(async (req, res, next) => {
  //datos recibidos del cliente
  const { titles, description, price, quantity, categoryId } = req.body;

  //valida si existe la categoria
  const searchCategories = await Categories.findOne({
    where: { id: categoryId, status: 'active' },
  });

  //validamos
  if (!searchCategories) {
    return next(new AppError('categories does not exist', 404));
  }

  //id del usuario
  const { sessionUser } = req;

  // creamos el producto
  const newProduct = await Products.create({
    titles,
    description,
    price,
    quantity,
    userId: sessionUser.id,
    categoryId,
  });

  const searchProduct = await Products.findOne({
    where: { id: newProduct.id, status: 'active' },
    include: [
      { model: Categories, require: false, where: { status: 'active' } },
    ],
  });

  // respodemos la peticion
  res.status(200).json({
    searchProduct,
  });
});

const getListProducts = catchAsync(async (req, res, next) => {
  //buscamos todos los productos disponibles
  const listProducts = await Products.findAll({ where: { status: 'active' } });

  //respondemos la peticion
  res.status(200).json({
    listProducts,
  });
});

const getListProductById = catchAsync(async (req, res, next) => {
  //datos enviados en la funcion productsExist
  const { products } = req;

  //enviamos la respuesta
  res.status(200).json({
    products,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  //usuario en session
  const { sessionUser } = req;

  //datos enviados en la funcion productsExist
  const { products } = req;

  if (sessionUser.id !== products.userId) {
    return next(new AppError('you are not the creator of this product', 404));
  }

  //datos recibidos por el cliente para realizar la autulizacion
  const { titles, description, price, quantity } = req.body;

  //actualizamos el producto
  await products.update({
    titles,
    description,
    price,
    quantity,
  });

  //envamos la respues
  res.status(200).json({
    status: 'success',
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  //usuario en session
  const { sessionUser } = req;

  //datos enviados en la funcion productsExist
  const { products } = req;

  if (sessionUser.id !== products.userId) {
    return next(new AppError('you are not the creator of this product', 404));
  }

  //actualizamos status a delete
  await products.update({ status: 'delete' });

  //enviamos la respuesta
  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  createProduct,
  getListProducts,
  getListProductById,
  updateProduct,
  deleteProduct,
};
