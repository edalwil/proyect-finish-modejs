const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const { User } = require('../models/user.model');
const { Products } = require('../models/products.models');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

//creamos usuario cliente o admistrador
const createUser = catchAsync(async (req, res, next) => {
  //dastos recibidos del cliente
  const { userName, email, password, role } = req.body;

  //encriptamos la constraseña
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  //enviamos la respuesta
  const newUser = await User.create({
    userName,
    email,
    password: hashPassword,
    role,
  });

  // Remove password from response
  newUser.password = undefined;

  res.status(201).json({ newUser });
});

//listado de productos creados por usuario admistrador
const getUserById = catchAsync(async (req, res, next) => {
  //buscamos el usuario que esta logiado
  const { sessionUser } = req;

  //buscamos el usuario y le agreagamos los productos creados por el
  const searchUser = await User.findOne({
    attributes: {
      exclude: ['password'],
    },
    where: { id: sessionUser.id, status: 'active' },
    include: [
      { model: Products, required: false, where: { status: 'active' } },
    ],
  });

  //enviamos la respuesta
  res.status(200).json({
    searchUser,
  });
});

//modificar usuario
const updateUser = catchAsync(async (req, res, next) => {
  //usuario exisitente
  const { user } = req;

  //datos enviados por usuario
  const { userName, email } = req.body;

  //modificamos el usuario
  await user.update({ userName, email });

  //enviamos la respuesta
  res.status(200).json({ status: 'success' });
});

//eliminar cuenta del usuario
const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'deleted' });

  res.status(200).json({
    status: 'success',
  });
});

//login del usuario cliente o admistrador
const login = catchAsync(async (req, res, next) => {
  //dastos recibidos del cliente
  const { email, password } = req.body;

  // Validate that user exists with given email
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Compare password with db
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });

  //escondemos la contraseña
  user.password = undefined;

  //enviamos la respuesta
  res.status(200).json({ token, user });
});

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
};
