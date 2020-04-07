const User = require('../models/user');

class UserController {
  addUser(user) {
    return User.create(user);
  };
};

module.exports = {
  UserController: new UserController(),
};
