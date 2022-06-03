const { Orders } = require('../models/orders.models');
const { User } = require('../models/user.model');
const { Products } = require('../models/products.models');

//utils
const { catchAsync } = require('../utils/catchAsync');

//listado de ordenes
const getAllOrders = catchAsync(async (req, res, next) => {
  //buscamos el usuario que esta logiado
  const { sessionUser } = req;

  //buscamos el usuario y le agreagamos los productos creados por el
  const searchUser = await User.findOne({
    attributes: {
      exclude: ['password'],
    },
    where: { id: sessionUser.id, status: 'active' },
    include: [{ model: Orders, required: false }],
  });

  //enviamos la respuesta
  res.status(200).json({
    searchUser,
  });
});

//detalle de una sola orden
const getOrderId = catchAsync(async (req, res, next) => {
  //id recibido por el cliente
  const { id } = req.params;

  //buscamos la order
  const searchOrder = await Orders.findOne({
    where: { id },
    include: [
      {
        model: User,
        attributes: {
          exclude: ['password'],
        },
      },
    ],
  });

  res.status(200).json({
    searchOrder,
  });
});

//enviamos el documentos
module.exports = { getAllOrders, getOrderId };
