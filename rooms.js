const envProvider = require('./env_provider');
const log = require('simple-node-logger').createSimpleLogger();

class Room{
  constructor(name, socket /*io.socket*/){
    this.name = name;
    this.url = url;
    this.socket = socket;
    this.users = [];
  };
  addUser(user){
    this.users.push(user);
    return this.users;
  };
}

class User{
  constructor(user_id, room_id){
    this.user_id = user_id;
    this.room = room_id;
  }
}

class Organizer{

  constructor(port){
    this.rooms = [];
    this.users = [];
    
    this.sockets = require('socket.io')(port, {
      serveClient: false,
      cookie: false
    }).sockets;

    this.attachEvents();
  }

  attachEvents(){
    this.sockets.on('connection', this.connect.bind(this));
  }

  connect(socket) {
    log.info("user: " , socket.id , " has connected!!");
    socket.on('room', this.joinRoom);
    socket.on('disconnecting', this.leaveRoom);
  }
  joinRoom(room){
    let socket = this;
    if(Object.keys(socket.rooms).length!=1){
      log.info("joining room failed");
      log.info("user is already in room: ",Object.keys(socket.rooms) );
      return;
    }
    socket.room = room;
    socket.join(room);
    log.info(socket.rooms);
    log.info("joined room:", room);
  }


  leaveRoom(err){
    socket = this;
    log.info(socket.room);
    room = Object.keys(socket.rooms);
    log.info("leaving room: ", room[1]);
  }

}

const organizer = new Organizer(envProvider.IO_PORT);
