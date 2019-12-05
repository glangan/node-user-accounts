const express = require('express');
const Sequelize = require('sequelize');
const { validationResult } = require('express-validator');
const router = express.Router();

const User = require('../models/user');
const userValidationRules = require('../utils/userValidation');
const loginValidationRules = require('../utils/loginValidation');
const {
  loginRedirect,
  profileRedirect
} = require('../utils/sessionMiddleware');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.findAll({})
    .then(data => {
      res.send(data);
    })
    .catch(error => console.log(error));
});

router.get('/profile', loginRedirect, function(req, res, next) {
  const { user } = req.session;
  if (user) {
    res.render('users/profile', { user });
  } else {
    res.redirect('/login');
  }
});

router.get('/register', profileRedirect, (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  userValidationRules(),
  profileRedirect,
  async (req, res) => {
    // Form validation
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
          req.session.user = user.dataValues;
          res.redirect('/users/profile');
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
  }
);

router.get('/login', profileRedirect, function(req, res, next) {
  res.render('users/login');
});

router.post('/login', loginValidationRules(), profileRedirect, async function(
  req,
  res,
  next
) {
  let errorMessages = validationResult(req).array({
    onlyFirstError: true
  });
  if (errorMessages.length != 0) {
    errorMessages = errorMessages.map(message => message.msg);
    res.render('users/login', { errorMessages });
  } else {
    try {
      const user = await User.findOne({
        where: { username: req.body.username }
      });
      if (!user) {
        errorMessages.push('Invalid Login');
        res.render('users/login', { errorMessages });
      } else if (!user.validatePassword(req.body.password)) {
        errorMessages.push('Invalid Login');
        res.render('users/login', { errorMessages });
      } else {
        req.session.user = user.dataValues;
        res.redirect('/users/profile');
      }
    } catch (error) {
      console.log(error);
      res.redirect('/users/login');
    }
  }
});

router.get('/logout', loginRedirect, function(req, res, next) {
  req.session.destroy(err => {
    if (err) {
      res.redirect('/');
    }
    res.clearCookie('sid');
    res.redirect('/users/login');
  });
});

module.exports = router;
