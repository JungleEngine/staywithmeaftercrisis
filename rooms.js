const envProvider = require('./env_provider');
const log = require('simple-node-logger').createSimpleLogger();



class Room{
  constructor(organizer, roomID, url='url'){
    this.id = roomID;
    this.url = url;
    this.organizer = organizer;
  };

}

class User{
  constructor(organizer, userSocket){
    log.info(`New user created from the organizer, userID:${userSocket.id}`)
    this.organizer = organizer
    this.socket = userSocket;
    this.id = userSocket.id;
    this.joinedRooms = {}; // Represents actuall joined rooms, json for fast lookup
    
    this.eventHandlers = {
      // joinRoom: this.joinRoom.bind(this) // Handles new socket joined a room; {eventName: callbackFunction}
      joinRoom: this.joinRoom.bind(this),
      createRoom: this.createRoom.bind(this)
    }

    this.attachUserEvents();
  }

  // Attaching events for a user, ex{join a room, send some data, disconnect..}
  // Each user is responsible for handling its own events, sending updates for organizer (master)
  // Organizer can change some users update frequence (throttle some users)
  // It can also neglect user updates

  attachUserEvents() {
    for (var event in this.eventHandlers){
      this.socket.on(event, this.eventHandlers[event]);
    }
    // log.info("user: " , socket.id , " has connected!!");
    // socket.on('room', this.joinRoom);
    // socket.on('disconnecting', this.leaveRoom);
  }


  // User joined a room (or create if not exist)
  joinRoom(data){
    var roomID = data.roomID;
    // User can get permission to join only created a room
    var roomExists = this.organizer.requestJoinRoom(this.socket, roomID);
    if(roomExists){
      this.socket.join(roomID);
      this.organizer.notify('roomJoined', this, '');
    }else{
      // Organizer(master) should take appropriate action with client
      // as the user is trying to join a room that is not created yet.
      this.organizer.notify('failedToJoinRoom', this, 'Room not created yet')
    }
  }

  // createRoom(data){

  // }
}



class Organizer{

  constructor(socketPort){
    this.rooms = {}; //json object instead of array for fast lookup {id:roomObject}
    this.users = {}; // Json object instead of array for fast lookup {id: userObject}
    
    this.allSockets = require('socket.io')(socketPort, {
      serveClient: false,
      cookie: false
    }).sockets;
    
    this.eventHandlers = {
      connection: this.newConnection.bind(this)
      // joinRoom: this.joinRoom.bind(this) // Handles new socket joined a room; {eventName: callbackFunction}
    }

    this.attachOrganizerEvents();
  }

  // New connection
  newConnection(socket){
    // Add new user to users list
    let userID = socket.id
    this.users.userID = new User(this, socket);
    //TODO: log and update stats
  }

  // attach events to new connection
  attachOrganizerEvents() {
    for (var event in this.eventHandlers){
      this.allSockets.on(event, this.eventHandlers[event]);
    }
    // log.info("user: " , socket.id , " has connected!!");
    // socket.on('room', this.joinRoom);
    // socket.on('disconnecting', this.leaveRoom);
  }

  requestJoinRoom(socket, roomID){
    // Check if room exist: if exist, and user is valid to join then return room, else return None
    // If room created before.
    if(this.rooms.hasOwnProperty(roomID)){
      return true;
    } else{ // Room not created
      return false;
    }
  }

  // Organizer should process notifications in order to keep in-sync with updates
  notify(action, caller, message){
    var callerType = ((caller instanceof User) ? 'User' : 'Room'); 
    log.info(`action: ${action} is submitted to the organizer from slave-type:${callerType} and id:${caller.id}`)
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
