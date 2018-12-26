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
io.on('connection', (socket) => {
    var joinedUser = false;

    //default username
    socket.username = "Anonymous"
    console.log(socket.username + ' connected')

    // update guest number
    ++numGuests
    io.sockets.emit('guest join', { numUsers: numUsers, numGuests: numGuests })

    //listen on new_message
    socket.on('new_message', (data) => {
        console.log('Message from ' + socket.username + ': ' + data.message)
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username })
    })

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', { username: socket.username })
    })

    // when the client emits 'user join', this listens and executes
    socket.on('user join', (username) => {
        if (joinedUser) return
        // we store the username in the socket session for this client
        socket.username = username
        ++numUsers
        joinedUser = true
        socket.emit('user join', { username: socket.username, numUsers: numUsers, numGuests: numGuests })
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user join', { username: socket.username, numUsers: numUsers, numGuests: numGuests })
        console.log(socket.username + " joined")
    })

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if (joinedUser) {
            --numUsers
        }
        --numGuests
        socket.broadcast.emit('user left', { username: socket.username, numUsers: numUsers, numGuests: numGuests })
        console.log(socket.username + " left")
    })
})