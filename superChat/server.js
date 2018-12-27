// Init Const
const express = require('express');
const app = express();
const http=require('http').Server(app);
const io = require("socket.io")(http);
const path = require('path');
const port = 3000;
// Init variables
var currentUser='Anonymous';

/*
 * Setting Mongodb
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/superchat", { useNewUrlParser: true });
mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
});
module.exports.user=mongoose.model('User',new Schema({
    name:String,
    password: String,
    email:String,
    friends:[]
},{strict: false}));

/*
 * Setting App API
 * app.post('/', handleTopRequest);
 * app.post('/register', handleRegister);
 * app.post('/login', handleLogin);
 * app.post('/friend_request', handleFriendRequest);  // emit to 'target client': event 'friendConfirm'
 * app.post('/friend_request/confirmed', handleFriendRequestConfirmed); // emit to 'destination client' and 'target client': event 'friendEstablished'
 */
app.use(express.static('./'));
app.get('/',function(req,res){
	res.sendFile(path.resolve(__dirname+"/views/index.html"));
});

// listen on every connection
io.on('connection', (client) => {
	// emit to client 'currentUser'
	console.log(currentUser+" connected");
	io.to(client.id).emit('currentUser', currentUser);
    // client.on('privateMessage', handlePrivateMessage)
    // client.on('groupMessage', handleGroupMessage)
    // client.on('disconnect', handleDisconnect)
    // client.on('error', handleError)
});

http.listen(port, function() {
    console.log('listening on http://localhost:' + port);
});