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
      log.error("in function addUser in Room class a null user has been sent");
      return;
    }
    this.users[user.id] = user;
  }
  removeUser(user) {
    let ret = "succ";
    if (!user) {
      log.error(
        "in function removeUser in Room class a null user has been sent"
      );
      ret = "err";
    }
    if (!this.users.hasOwnProperty(user.id)) {
      log.error("in function removeUser in Room class, user is not in room");
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
    log.info(`setting new url:${url}`);
    this.url = url;
    this.broadcast("setURL", { url: url });
  }

  broadcast(channel, data) {
    log.info(`broadcasting channel:${channel} and sending data:`, data);
    const usersKeys = Object.keys(this.users);
    for (const id in usersKeys) {
      if (Object.prototype.hasOwnProperty.call(usersKeys, id)) {
        const user = this.users[usersKeys[id]];
        user.socket.emit(channel, data);
      }
    }
  }
  broadcastExceptForSender(channel, data, senderID) {
    log.info(`broadcasting channel:${channel} and sending data:`, data);
    const usersKeys = Object.keys(this.users);
    for (const indx in usersKeys) {
      if (Object.prototype.hasOwnProperty.call(usersKeys, indx)) {
        if (usersKeys[indx] !== senderID) {
          const user = this.users[usersKeys[indx]];
          user.socket.emit(channel, data);
        }
      }
    }
  }
  sendURLToUser(user) {
    if (this.url) {
      user.socket.emit("setURL", { url: this.url });
    }
  }
}

module.exports = Room;
