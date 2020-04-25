const envProvider = require("./env_provider");
const log = require("simple-node-logger").createSimpleLogger();

const User = require("./src/user");
const Room = require("./src/room");

class Organizer {
  constructor(server) {
    this.rooms = {}; //json object instead of array for fast lookup {id:roomObject}
    this.users = {}; // Json object instead of array for fast lookup {id: userObject}

    this.allSockets = require("socket.io")(server).sockets;

    this.eventHandlers = {
      connection: this.newConnection.bind(this),
    };
    this.deleteUser = this.deleteUser.bind(this);
    this.setRoomURL = this.setRoomURL.bind(this);

    this.attachOrganizerEvents();
  }

  // New connection
  async newConnection(socket) {
    // Add new user to users list
    console.log(socket.handshake.query);
    console.log(socket.handshake.query.action);
    console.log(socket.handshake.query.roomName);

    let action = socket.handshake.query.action;
    let roomName = socket.handshake.query.roomName;

    let ret = "invalid";

    if (action == "create") {
      ret = this.createUserInRoom(socket, roomName);
    } else if (action == "join") {
      let user = new User(this, socket);
      ret = this.joinRoom(user, roomName);
      if (ret != "succ") {
        console.log("closing connection with client!");
        await user.forceDisconnect();
        this.deleteUser(user);
      } else {
        user.attachUserEvents();
      }
    } else {
      // empty line
    }

    //TODO: log and update stats
  }

  async userDisconnecting(user, err) {
    log.info("userDisconnecting");
    let ret = await this.leaveRoom(user);
    if (ret === "succ") {
      if (this.rooms[user.roomName].hasUsers() === false) {
        delete this.rooms[user.roomName];
      }
    }
    this.deleteUser(user);
  }

  deleteUser(user) {
    delete this.users[user.id];
  }

  async leaveRoom(user) {
    if (user.roomName == null) {
      log.info(`user leaving room:${user.roomName}`);
      return "err";
    }
    if (!this.rooms.hasOwnProperty(user.roomName)) {
      log.info(
        `user leaving a room which isn't registered, room name:${user.roomName}`
      );
      return "err";
    }
    log.info("async leaveRoom");
    this.rooms[user.roomName].removeUser(user);
    return "succ";
  }

  createUserInRoom(socket, roomName) {
    let ret = "err";
    let state = this.getRoomState(roomName);
    if (state == "new") {
      log.info("creating user in new room");
      this.createRoom(roomName);
      let user = new User(this, socket);
      ret = this.joinRoom(user, roomName);
      if (ret != "succ") {
        this.deleteUser(user);
      } else {
        user.attachUserEvents();
      }
    } else {
      log.info("user trying to create an existing room");
      ret = "err";
    }
    return ret;
  }

  joinRoom(user, roomName) {
    log.info("joining room");
    if (!roomName) {
      console.log("ERROR trying to join a room with an empty name");
      return "err";
    }
    if (!this.rooms.hasOwnProperty(roomName)) {
      console.log("ERROR trying to join a room which isn't created");
      return "err";
    }
    user.setRoom(roomName);
    this.rooms[roomName].addUser(user);
    this.rooms[roomName].sendURLToUser(user);
    return "succ";
  }

  createRoom(roomName) {
    this.rooms[roomName] = new Room(
      this,
      roomName,
      "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
    );
  }

  getRoomState(roomName) {
    let ret;
    if (!roomName || roomName == "") {
      ret = "invalid";
    } else if (this.rooms.hasOwnProperty(roomName)) {
      ret = "exists";
    } else {
      ret = "new";
    }
    return ret;
  }

  setRoomURL(user, data) {
    if (!this.rooms.hasOwnProperty(user.roomName)) {
      log.info(
        `user trying to set url for room:${user.roomName} which isn't registered in organizer rooms`
      );
      return;
    }
    this.rooms[user.roomName].setURL(data.url);
  }

  // attach events to new connection
  attachOrganizerEvents() {
    for (var event in this.eventHandlers) {
      this.allSockets.on(event, this.eventHandlers[event]);
    }
  }

  // Organizer should process notifications in order to keep in-sync with updates
  notify(action, caller, message) {
    var callerType = caller instanceof User ? "User" : "Room";
    log.info(
      `action: ${action} is submitted to the organizer from slave-type:${callerType} and id:${caller.id}`
    );
  }
}
// const organizer = new Organizer(server);
module.exports = {
  Organizer: Organizer,
};
