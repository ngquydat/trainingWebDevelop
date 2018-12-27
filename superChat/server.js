// Init Const
const express = require('express');
const app = express();
const http=require('http').Server(app);
const io = require("socket.io")(http);
const path = require('path');
const port = 3000;
// Init variables
var currentUser='Anonymous';

app.use(express.static('./'));
/*
 * API
 * app.post('/', handleTopRequest);
 * app.post('/register', handleRegister);
 * app.post('/login', handleLogin);
 * app.post('/friend_request', handleFriendRequest);  // emit to 'target client': event 'friendConfirm'
 * app.post('/friend_request/confirmed', handleFriendRequestConfirmed); // emit to 'destination client' and 'target client': event 'friendEstablished'
 */
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