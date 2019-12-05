const { check } = require('express-validator');

const loginValidationRules = () => {
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

module.exports = loginValidationRules;
