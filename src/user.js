const log = require("simple-node-logger").createSimpleLogger();
class User {
  constructor(organizer, userSocket) {
    log.info(`New user created from the organizer, userID: ${userSocket.id}`);
    this.organizer = organizer;
    this.socket = userSocket;
    this.id = userSocket.id;
    this.eventHandlers = {
      update: this.update.bind(this),
      setRoomURL: this.setRoomURL.bind(this),
      disconnecting: this.disconnecting.bind(this),
    };
    this.roomName = null;
  }
  setRoomURL(data) {
    log.info("setRoomURL:", data);
    if (this.roomName == null) {
      log.info("user trying to set url but didn't join room");
      return;
    }
    if (data == null || !data.hasOwnProperty("url")) {
      log.info("user trying to set url for room but url is null");
      return;
    }
    this.organizer.setRoomURL(this, data);
  }
  update(data) {
    log.info("Update event: ", data);
  }
  setRoom(roomName) {
    this.roomName = roomName;
  }
  disconnecting(err) {
    log.info(`user:${this.id} is disconnecting`);
    this.organizer.userDisconnecting(this, err);
  }
  async forceDisconnect() {
    this.socket.disconnect(true);
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

module.exports = User;
