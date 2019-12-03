const express = require('express');
const Sequelize = require('sequelize');
const { validationResult } = require('express-validator');
const router = express.Router();

const User = require('../models/user');
const userValidationRules = require('../utils/userValidation');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.findAll({})
    .then(data => {
      res.send(data);
    })
    .catch(error => console.log(error));
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', userValidationRules(), async (req, res) => {
  let errorMessages = validationResult(req).array({
    onlyFirstError: true
  });
  if (errorMessages.length != 0) {
    console.log('here');
    errorMessages = errorMessages.map(message => message.msg);
    res.render('users/register', { errorMessages });
  } else {
    try {
      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });

      if (user) {
        res.redirect('/');
      }
    } catch (error) {
      if (error instanceof Sequelize.ValidationError) {
        let errorMessages = [];
        error.errors.forEach(obj => {
          errorMessages.push(obj.message);
        });
        res.render('users/register', { errorMessages });
      } else {
        console.log(error);
        res.status(500).send();
      }
    }
  }
});

module.exports = router;
