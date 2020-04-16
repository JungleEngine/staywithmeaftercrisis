// import './socket.io.js' as io
// io = require('./socket.io.js');

// var socket = io('http://localhost:3000');
var socket = io('http://localhost:3000',{query:'roomName=roomy&action=create' });
// socket.emit('room', 'room1');

function send(){
	console.log("test");
	val = document.getElementById('action').value;
	socket.emit('update',{action:val});
}