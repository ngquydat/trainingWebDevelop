const express = require('express')
const app = express()
const port = 3000

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))

//routes
app.get('/', (req, res) => {
    res.render('index')
})

//Listen on port 3000
server = app.listen(port, function() {
    console.log('listening on *:' + port)
})

var numGuests = 0
var numUsers = 0

//socket.io instantiation
const io = require("socket.io")(server)

//listen on every connection
io.on('connection', (client) => {
    // client.on('register', handleRegister)
    // client.on('join', handlejoin)
    // client.on('leave', handleLeave)
    // client.on('message', handleMessage)
    // client.on('chatrooms', handleGetChatrooms)
    // client.on('availableUsers', handleGetAvailableUsers)
    // client.on('disconnect', handleDisconnect)
    // client.on('error', handleError)
    var loggedInUser = false;

    //default username
    client.username = "Anonymous"
    console.log(client.username + ' connected - clientId: '+client.id)

    // update guest number
    ++numGuests
    io.sockets.emit('guest login', { numUsers: numUsers, numGuests: numGuests })

    //listen on new_message
    client.on('new_message', (data) => {
        console.log('Message from ' + client.username + ': ' + data.message)
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: client.username })
    })

    //listen on typing
    client.on('typing', (data) => {
        client.broadcast.emit('typing', { username: client.username })
    })

    // when the client emits 'stop typing', we broadcast it to others
    client.on('stop typing', () => {
        client.broadcast.emit('stop typing', { username: client.username })
    })

    // when the client emits 'login', this listens and executes
    client.on('login', (username) => {
        if (loggedInUser) return
        // we store the username in the socket session for this client
        client.username = username
        ++numUsers
        loggedInUser = true
        client.emit('login', { username: client.username, numUsers: numUsers, numGuests: numGuests })
        // echo globally (all clients) that a person has connected
        client.broadcast.emit('login', { username: client.username, numUsers: numUsers, numGuests: numGuests })
        console.log(client.username + " loggedIn")
    })

    // when the user disconnects.. perform this
    client.on('disconnect', () => {
        if (loggedInUser) {
            --numUsers
        }
        --numGuests
        client.broadcast.emit('user left', { username: client.username, numUsers: numUsers, numGuests: numGuests })
        console.log(client.username + " left", client.id)
    })

    client.on('error', function (err) {
        console.log('received error from client:', client.id)
        console.log(err)
    })
})