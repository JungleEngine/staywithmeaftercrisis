const routeDispatcher = function(app) {
  app.use('/', require('./bootstrap/index'));
  app.use('/user', require('./user'));
};

module.exports = {routeDispatcher};
