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