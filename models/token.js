const Sequelize = require('sequelize');
const sequelize = require('./db/sequelize');

const User = require('./user');

const Model = Sequelize.Model;

class Token extends Model {}

Token.init(
  {
    token: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'token'
  }
);

Token.belongsTo(User);

sequelize
  .sync()
  .then(() =>
    console.log(
      'Token table has been created successfully, if one did not exist'
    )
  )
  .catch(error => {
    console.log('Error: ', error);
  });

module.exports = Token;
