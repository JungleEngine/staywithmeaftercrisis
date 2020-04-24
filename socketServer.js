const envProvider = require("./env_provider");
const log = require("simple-node-logger").createSimpleLogger();

class Room {
  constructor(organizer, roomID, url = "url") {
    this.id = roomID;
    this.url = url;
    this.organizer = organizer;
  }
}

class User {
  constructor(organizer, userSocket) {
    log.info(`New user created from the organizer, userID: ${userSocket.id}`);
    this.organizer = organizer;
    this.socket = userSocket;
    this.id = userSocket.id;
    this.eventHandlers = {
      update: this.update.bind(this)
    };
  }
  update(data) {
    log.info("Update event: ", data);
  }
  // Attaching events for a user, ex{update}
  // Each user is responsible for handling its own events, sending updates for organizer (master)
  // Organizer can change some users update frequence (throttle some users)
  // It can also neglect user updates
  attachUserEvents() {
    for (var event in this.eventHandlers) {
      this.socket.on(event, this.eventHandlers[event]);
    }
  }
}

class Organizer {
  constructor(server) {
    this.rooms = {}; //json object instead of array for fast lookup {id:roomObject}
    this.users = {}; // Json object instead of array for fast lookup {id: userObject}

    this.allSockets = require("socket.io")(server).sockets;

    this.eventHandlers = {
      connection: this.newConnection.bind(this)
    };

    this.attachOrganizerEvents();
  }

  // New connection
  newConnection(socket) {
    // Add new user to users list
    log.info(socket.handshake.query);
    log.info(socket.handshake.query.action);
    log.info(socket.handshake.query.roomName);

    let action = socket.handshake.query.action;
    let roomName = socket.handshake.query.roomName;

    let ret = "invalid";

    if (action == "create") {
      ret = this.createUserInRoom(socket, roomName);
    } else if (action == "join") {
      ret = this.joinRoom(socket, roomName);
    } else {
    }

    //TODO: log and update stats
  }
  createUserInRoom(socket, roomName) {
    log.info("creating user in new room");
    // validate room
    let state = this.getRoomState(roomName);
    if (state == "new") {
      // create room
      this.createRoom(roomName);
      let user = new User(this, socket);
      this.joinRoom(user, roomName);
      user.attachUserEvents();
    }
    log.info("room state:", state);
  }

  joinRoom(user, roomName) {
    user.socket.join(roomName);
    log.info("joining room");
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
  // attach events to new connection
  attachOrganizerEvents() {
    for (var event in this.eventHandlers) {
      this.allSockets.on(event, this.eventHandlers[event]);
    }
  }

  requestJoinRoom(socket, roomID) {
    // Check if room exist: if exist, and user is valid to join then return room, else return None
    // If room created before.
    if (this.rooms.hasOwnProperty(roomID)) {
      return true;
    } else {
      // Room not created
      return false;
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
  Organizer: Organizer
};
