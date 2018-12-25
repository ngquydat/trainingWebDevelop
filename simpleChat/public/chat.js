$(function(){
	//make connection
	var socket = io.connect('http://localhost:3000')

	//buttons and inputs
	var message = $("#message")
	var username = $("#username")
	var send_message_btn = $("#send_message_btn")
	var send_username_btn = $("#send_username_btn")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")

	//Emit message
	send_message_btn.click(function(){
		console.log("user clicked on 'send' message button")
		socket.emit('new_message', {message : message.val()})
	})

	//Emit a username
	send_username_btn.click(function(){
		console.log("user clicked on 'change username' button")
		socket.emit('change_username', {username : username.val()})
	})

	//Emit typing
	message.bind("keypress", () => {
		console.log("user typing ...")
		socket.emit('typing')
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});