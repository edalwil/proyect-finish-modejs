const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError');

const createUserValidations = [
  body('name').notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const createProductValidations = [
  body('title').notEmpty().withMessage('title cannot be empty'),
  body('desciption').notEmpty().withMessage('Drecriptation cannot be empty'),
  body('price').isFloat({ min: 0 }).withMessage('price must be greater than 0'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('quantity must be greater than 0'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('mult provide a valid category'),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);

    // [msg, msg, msg] -> 'msg. msg. msg'
    const errorMsg = messages.join('. ');

    return next(new AppError(errorMsg, 400));
  }

  next();
};

module.exports = {
  createUserValidations,
  checkValidations,
  createProductValidations,
};
