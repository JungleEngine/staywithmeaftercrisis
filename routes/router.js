const routeDispatcher = function(app) {
  app.use('/', require('./bootstrap/index'));
};

module.exports = {routeDispatcher};
