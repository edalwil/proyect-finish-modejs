const express = require('express');

// Middlewares
const {
  userExists,
  protectToken,
  protectAccountOwner,
  protectAdmin,
} = require('../middlewares/users.middlewares');

// Controller
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
  checkToken,
} = require('../controllers/users.controller');

const {
  getAllOrders,
  getOrderId,
} = require('../controllers/orders.controllers');

const router = express.Router();

//endpoint

router.post('/', createUser);

router.post('/login', login);

// Apply protectToken middleware
router.use(protectToken);

router.get('/me', getUserById);

router
  .route('/:id')
  .patch(userExists, protectAccountOwner, updateUser)
  .delete(userExists, protectAccountOwner, deleteUser);

//enpoint orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', userExists, protectAccountOwner, getOrderId);

module.exports = { usersRouter: router };
