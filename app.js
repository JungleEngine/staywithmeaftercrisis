const log = require('simple-node-logger').createSimpleLogger();

const http = require('http');

const envProvider = require('./env_provider');

const express = require('express');

const app = express();

require('./routes/router').routeDispatcher(app);

const port = envProvider.PORT;

app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', onError);
server.on('listening', onListening);

/**
* Event listener for HTTP server "error" event.
* @param {Object} error returned.
*/
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
* Event listener for HTTP server "listening" event.
*/
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
'pipe ' + addr :
'port ' + addr.port;
  log.info(bind);
  log.info('server started successfully, listening to : ' + addr.port);
}


module.exports = app;
