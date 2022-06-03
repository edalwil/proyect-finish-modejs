const express = require('express');

//middleware
const { protectToken } = require('../middlewares/users.middlewares');
const { validatorProductInCart } = require('../middlewares/carts.middlewares');

//controller
const {
  addProductCart,
  deleteProductCart,
  purchaseProductCart,
  updateProductCart,
  getUserCard,
} = require('../controllers/carts.conttoller');

const router = express.Router();

//endpoint
// Apply protectToken middleware
router.use(protectToken);

router.get('/', getUserCard);

router.post('/add-product', addProductCart);
router.patch('/update-cart', updateProductCart);
router.delete('/:productId', deleteProductCart);
router.post('/purchase', purchaseProductCart);

//exportamos
module.exports = { cartRouter: router };
