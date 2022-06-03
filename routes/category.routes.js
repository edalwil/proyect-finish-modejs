const express = require('express');

const router = express.Router();

//controller
const {
  createCategory,
  getAllCategories,
  updataCategories,
} = require('../controllers/categories.controller');

//middleware
const { protectToken } = require('../middlewares/users.middlewares');

//enpoind
router.get('/', getAllCategories);

// Apply protectToken middleware
router.use(protectToken);

router.post('/', createCategory);

router.patch('/:id', updataCategories);

//exportamos
module.exports = { categoriesRouter: router };
