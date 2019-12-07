const { check } = require('express-validator');

const resendValidation = () => {
  return [
    check('email')
      .not()
      .isEmpty()
      .withMessage('Email is required')
  ];
};

const loginValidation = () => {
  return [
    check('username')
      .not()
      .isEmpty()
      .withMessage('Username is required'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
  ];
};

const registerValidation = () => {
  return [
    check('username')
      .not()
      .isEmpty()
      .withMessage('Username is required')
      .isAlphanumeric()
      .withMessage('Invalid Username'),
    check('email')
      .not()
      .isEmpty()
      .withMessage('Email is required')
      .normalizeEmail()
      .isEmail()
      .withMessage('Invalid Email'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
  ];
};

module.exports = { resendValidation, loginValidation, registerValidation };
