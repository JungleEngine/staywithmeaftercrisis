const log = require("simple-node-logger").createSimpleLogger();
class Room {
  constructor(organizer, roomID, url = "default_url") {
    this.id = roomID;
    this.url = url;
    this.organizer = organizer;
    this.users = {};
  }
  addUser(user) {
    if (!user) {
      log.info(
        "ERROR in function addUser in Room class a null user has been sent"
      );
      return;
    }
    this.users[user.id] = user;
  }
  removeUser(user) {
    let ret = "succ";
    if (!user) {
      log.info(
        "ERROR in function removeUser in Room class a null user has been sent"
      );
      ret = "err";
    }
    if (!this.users.hasOwnProperty(user.id)) {
      log.info(
        "ERROR in function removeUser in Room class, user is not in room"
      );
      ret = "err";
    }
    if (ret === "succ") {
      delete this.users[user.id];
    }
  }
  hasUsers() {
    if (Object.keys(this.users).length == 0) {
      return false;
    }
    return true;
  }
  setURL(url) {
    this.url = url;
    this.broadcast("setURL", url);
  }

  broadcast(channel, data) {
    console.log("setting URL!");
    let usrs = Object.keys(this.users);
    for (let id in usrs) {
      let user = this.users[usrs[id]];
      user.socket.emit(channel, data);
    }
  }

  sendURLToUser(user) {
    if (this.url) {
      user.socket.emit("setURL", this.url);
    }
  }
}

module.exports = Room;
