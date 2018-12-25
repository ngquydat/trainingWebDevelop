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
    console.log('listening on *:'+port)
})

//socket.io instantiation
const io = require("socket.io")(server)

//listen on every connection
io.on('connection', (socket) => {
	//default username
	socket.username = "Anonymous"
	console.log(socket.username+' connected')

    //listen on change_username
    socket.on('change_username', (data) => {
    	console.log(socket.username+' has changed name to: '+data.username)
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
    	console.log('Message from '+socket.username+': '+data.message)
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username})
    })

    //listen on typing
    socket.on('typing', (data) => {
    	console.log(socket.username+' is typing ...')
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})