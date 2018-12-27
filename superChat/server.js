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
const db = module.exports;
db.user = mongoose.model('User',new Schema({
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
const bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(express.static('./'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', function(req,res){
    res.sendFile(path.resolve(__dirname+"/views/index.html"));
});
app.post('/register', function(req,res){
    console.log(req.body);
    newUser = req.body;
    // 1. check user is exists
    db.user.findOne({"username":newUser.username}, function(err, doc){
        if (err) res.json(err);
        else if (doc) res.send('User already registered');
        else {
            // 2. if not exists, add new user
            db.user.create(newUser, function(err, doc){
                if(err) res.json(err);
                else res.send("success");
            });
        }
    });
});
app.post('/login', function(req,res){
    loginUser = req.body;
    console.log(loginUser);
    currentUser = loginUser.username;
    db.user.findOne({"username":loginUser.username,"password":loginUser.password}, function(err,doc){
        if (err) res.send(err);
        else if (doc) res.send('success');
        else {
            res.send('User has not registered');
        }
    });
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