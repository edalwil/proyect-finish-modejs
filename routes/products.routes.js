const express = require('express');

const router = express.Router();

//middleware
const { protectToken } = require('../middlewares/users.middlewares');
const {
  productsExist,
  protectProduct,
} = require('../middlewares/products.middlewares');

const {
  createProductValidations,
} = require('../middlewares/validations.middlewares');

//controller products
const {
  createProduct,
  getListProducts,
  deleteProduct,
  getListProductById,
  updateProduct,
} = require('../controllers/products.controller');

//endpoint
router.get('/', getListProducts);

router.get('/:id', productsExist, getListProductById);

// Apply protectToken middleware
router.use(protectToken);

router.post('/', createProductValidations, createProduct);

router
  .route('/:id')
  .patch(productsExist, protectProduct, updateProduct)
  .delete(productsExist, protectProduct, deleteProduct);

//exportamos
module.exports = { productsRouter: router };
