//models
const { Categories } = require('../models/categories.models');

//utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

//listado de categorias
const getAllCategories = catchAsync(async (req, res, next) => {
  //   buscamos todas la categorias
  const searchCategories = await Categories.findAll({
    where: { status: 'active' },
  });

  //enviamos la respuesta
  res.status(201).json({
    searchCategories,
  });
});

//crear categoria
const createCategory = catchAsync(async (req, res, next) => {
  //datos enviados por el cliente
  const { name } = req.body;

  //validamos name tengo datos
  if (name.length === 0) {
    return next(new AppError('no value entered', 404));
  }

  //creamos la categoria
  const newCategory = await Categories.create({ name });

  //enviamos la peticion
  res.status(202).json({
    newCategory,
  });
});

//buscar categoria por ID
const updataCategories = catchAsync(async (req, res, next) => {
  //id de la categoria
  const { id } = req.params;

  //datos enviados por el cliente
  const { name } = req.body;

  //buscamos la categoria
  const searchCategoriesId = await Categories.findOne({
    where: { id, status: 'active' },
  });

  //validamos si existe la categoria
  if (!searchCategoriesId) {
    return next(new AppError('id does not existe', 404));
  }

  if (name.length === 0) {
    return next(new AppError('no value entered', 404));
  }

  //autualizamos la categoria
  const updateCategory = await searchCategoriesId.update({ name });

  //enviamos la respuesta
  res.status(201).json({
    updateCategory,
  });
});

//exportamos
module.exports = { getAllCategories, createCategory, updataCategories };
