const log = require('simple-node-logger').createSimpleLogger();

const User = require('./src/user');
const Room = require('./src/room');

class Organizer {
  constructor(server) {
    this.rooms = {};
    this.users = {};

    this.allSockets = require('socket.io')(server).sockets;

    this.eventHandlers = {
      connection: this.newConnection.bind(this),
    };
    this.deleteUser = this.deleteUser.bind(this);
    this.setRoomURL = this.setRoomURL.bind(this);
    this.deleteRoomIfEmpty = this.deleteRoomIfEmpty.bind(this);
    this.attachOrganizerEvents();
  }

  // New connection
  async newConnection(socket) {
    const action = socket.handshake.query.action;
    const roomName = socket.handshake.query.roomName;
    log.info(
        `new connection, userID=${socket.id}\
       action=${action} roomName=${roomName}`,
    );

    let ret = 'err';
    const user = new User(this, socket);

    if (action == 'create') {
      ret = this.createRoom(roomName);
    }

    if ((action == 'create' && ret == 'succ') || action == 'join') {
      ret = this.joinRoom(user, roomName);
    }

    if (ret == 'succ') {
      user.attachUserEvents();
    } else {
      log.error('closing connection with client!');
      await user.forceDisconnect();
      this.deleteUser(user);
    }
  }

  userDisconnecting(user, err) {
    log.info('userDisconnecting');
    this.leaveRoom(user);
    this.deleteUser(user);
  }

  deleteUser(user) {
    delete this.users[user.id];
  }

  leaveRoom(user) {
    if (user.roomName == null) {
      log.error(`user leaving room:${user.roomName}`);
      return 'err';
    }
    if (!this.rooms.hasOwnProperty(user.roomName)) {
      log.error(
          `user leaving a room which isn't registered,\
           room name:${user.roomName}`,
      );
      return 'err';
    }
    this.rooms[user.roomName].removeUser(user);
    log.info(`user:${user.id} leaveing room:${user.roomName}`);

    this.deleteRoomIfEmpty(user.roomName);

    return 'succ';
  }
  deleteRoomIfEmpty(roomName) {
    if (this.rooms[roomName].hasUsers() === false) {
      log.info(`deleting empty room:${roomName}`);
      delete this.rooms[roomName];
    }
  }

  joinRoom(user, roomName) {
    log.info('joining room');
    if (!roomName) {
      log.error('trying to join a room with an empty name');
      return 'err';
    }
    if (!this.rooms.hasOwnProperty(roomName)) {
      log.error('trying to join a room which isn\'t created');
      return 'err';
    }
    user.setRoom(roomName);
    this.rooms[roomName].addUser(user);
    this.rooms[roomName].sendURLToUser(user);
    return 'succ';
  }

  createRoom(roomName) {
    let ret = 'err';
    const state = this.getRoomState(roomName);
    if (state == 'new') {
      log.info('creating user in new room');
      this.rooms[roomName] = new Room(
          this,
          roomName,
          'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      );
      ret = 'succ';
    } else {
      log.error(
          'failed to create new room, older room exists with the same name.',
      );
    }
    return ret;
  }

  getRoomState(roomName) {
    let ret;
    if (!roomName || roomName == '') {
      ret = 'invalid';
    } else if (this.rooms.hasOwnProperty(roomName)) {
      ret = 'exists';
    } else {
      ret = 'new';
    }
    return ret;
  }

  setRoomURL(user, data) {
    if (!this.rooms.hasOwnProperty(user.roomName)) {
      log.error(
          `user trying to set url for room:${user.roomName}\
          which isn't registered in organizer rooms`,
      );
      return;
    }
    this.rooms[user.roomName].setURL(data.url);
  }

  // attach events to new connection
  attachOrganizerEvents() {
    for (const event in this.eventHandlers) {
      if (Object.prototype.hasOwnProperty.call(this.eventHandlers, event)) {
        this.allSockets.on(event, this.eventHandlers[event]);
      }
    }
  }
  // Organizer processes notifications to sync updates
  notify(action, caller, message) {
    const callerType = caller instanceof User ? 'User' : 'Room';
    log.info(
        `action: ${action} is submitted to the organizer\
       from slave-type:${callerType} and id:${caller.id}`,
    );
  }
}

module.exports = {
  Organizer: Organizer,
};
