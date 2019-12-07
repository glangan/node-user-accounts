const express = require('express');
const Sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const router = express.Router();

require('dotenv').config();

const User = require('../models/user');
const Token = require('../models/token');

const userValidationRules = require('../utils/userValidation');
const loginValidationRules = require('../utils/loginValidation');
const {
  loginRedirect,
  profileRedirect
} = require('../utils/sessionMiddleware');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

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

// Registration Routes

router.get('/register', profileRedirect, (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  userValidationRules(),
  profileRedirect,
  async (req, res) => {
    try {
      let messages = validationResult(req).array({
        onlyFirstError: true
      });
      if (messages.length != 0) {
        console.log('here');
        messages = messages.map(message => message.msg);
        res.render('users/register', { messages });
      } else {
        const user = await User.create({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
        });

        if (!user) {
          throw new Error('Failed to create user');
        }

        const randomToken =
          Math.random()
            .toString(36)
            .substr(2) +
          Math.random()
            .toString(36)
            .substr(2);

        const token = await Token.create({
          token: randomToken,
          userId: user.dataValues.id
        });

        if (!token) {
          throw new Error('Failed to create token');
        }

        // send verificatio email
        const data = {
          from: process.env.EMAIL_USERNAME,
          to: user.email,
          subject: 'Email verification',
          text: `Hello \n\n Please verify your account by clicking the following link: \n\n http://localhost:3000/users/register/verify/${token.token}`
        };
        transporter.sendMail(data, function(err) {
          if (err) {
            throw new Error('Failed to send verification email');
          } else {
            res.render('users/register', {
              messages: ['Verification email sent']
            });
          }
        });
      }
    } catch (error) {
      if (error instanceof Sequelize.ValidationError) {
        let messages = [];
        error.errors.forEach(obj => {
          messages.push(obj.message);
        });
        res.render('users/register', { messages });
      } else {
        console.log(error);
        res.status(500).send();
      }
    }
  }
);

router.get('/register/verify/:token', async function(req, res) {
  const tokenString = req.params.token;
  const now = new Date();
  try {
    const token = await Token.findOne({
      where: { token: tokenString }
    });
    if (!token) {
      res.render('users/verify', { message: 'The token is invalid' });
    } else if (now - token.updatedAt > 24 * 60 * 60 * 1000) {
      res.render('users/verify', { message: 'The token is expired' });
    } else {
      const user = await User.update(
        {
          isVerified: true
        },
        { where: { id: token.userId } }
      );
      if (!user) {
        throw new Error('Cannot find user');
      }
      token.destroy();
      res.render('users/verify', {
        message: 'Your account is verified. Please login'
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// Authentication Routes

router.get('/login', profileRedirect, function(req, res, next) {
  res.render('users/login');
});

router.post('/login', loginValidationRules(), profileRedirect, async function(
  req,
  res,
  next
) {
  try {
    let errorMessages = validationResult(req).array({
      onlyFirstError: true
    });
    if (errorMessages.length != 0) {
      errorMessages = errorMessages.map(message => message.msg);
      res.render('users/login', { errorMessages });
    } else {
      const user = await User.findOne({
        where: { username: req.body.username }
      });
      if (!user) {
        res.render('users/login', { errorMessages: ['Invalid Login'] });
      } else if (!user.validatePassword(req.body.password)) {
        res.render('users/login', { errorMessages: ['Invalid Login'] });
      } else if (!user.isVerified) {
        res.render('users/login', {
          errorMessages: ['Please verify your email']
        });
      } else {
        req.session.user = user.dataValues;
        res.redirect('/users/profile');
      }
    }
  } catch (error) {
    console.log(error);
    res.redirect('/users/login');
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
