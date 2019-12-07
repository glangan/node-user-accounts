const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('./db/sequelize');

const Model = Sequelize.Model;

class User extends Model {}

User.init(
  {
    username: {
      type: Sequelize.STRING,
      unique: {
        msg: 'Username already exists'
      },
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: {
        msg: 'Email already exists'
      },
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      default: false
    }
  },
  {
    sequelize,
    modelName: 'user'
  }
);

User.beforeCreate(async function(user) {
  const saltRounds = 8;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    throw new Error();
  }
});

User.prototype.validatePassword = function(password) {
  const match = bcrypt.compareSync(password, this.password);
  return match;
};

sequelize
  .sync()
  .then(() =>
    console.log(
      'Users table has been created successfully, if one did not exist'
    )
  )
  .catch(error => {
    console.log('Error: ', error);
  });

module.exports = User;
