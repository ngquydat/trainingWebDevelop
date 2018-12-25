$(function(){
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
	})

	//Emit a username
	send_username_btn.click(function(){
		console.log("user clicked on 'change username' button")
	})

	//Emit typing
	message.bind("keypress", () => {
		console.log("user typing ...")
	})
});