$(function() {
    // make connection to node server
    var socket = io.connect('http://localhost:3000')

    var username
    var lastTypingTime
    var TYPING_TIMER_LENGTH = 400 // ms
    var connected           = false
    var typing              = false

    var $window             = $(window);
    var $inputMessage       = $("#inputMessage")
    var $usernameInput      = $('.usernameInput') // Input for username
    var $currentInput       = $usernameInput.focus()
    var $loginPage          = $('.login.page') // The login page
    var $chatPage           = $('.chat.page') // The chatroom page

    $loginPage.click(() => {
        $currentInput.focus()
    });

    // Keyboard events
    $window.keydown(event => {
        $currentInput.focus()
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            // If the username is valid
            if (username) {
                socket.emit('new_message', { message: $inputMessage.val() })
                socket.emit('stop typing')
                typing = false;
            } else {
                username = $usernameInput.val().trim()
                if (username) {
                    $loginPage.fadeOut()
                    $chatPage.show()
                    $loginPage.off('click')
                    $currentInput = $inputMessage.focus()

                    // Tell the server your username
                    socket.emit('user join', username)
                }
            }
        }
    });

    //Emit typing
    $inputMessage.bind("keypress", () => {
        if (connected) {
            if (!typing) {
                typing = true
                socket.emit('typing')
            }
            lastTypingTime = (new Date()).getTime()

            setTimeout(() => {
                var typingTimer = (new Date()).getTime()
                var timeDiff = typingTimer - lastTypingTime
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing')
                    typing = false
                }
            }, TYPING_TIMER_LENGTH)
        }
    })

    // Whenever the server emits 'user join', log the user join message
    socket.on('user join', (data) => {
        connected = true
        $('#numUsers').html("participants: " + data.numUsers + " - total viewers: " + data.numGuests);
        $('#info').html('<p>' + data.username + ' join</p>')
    })

    // Whenever the server emits 'user join', log the user join message
    socket.on('guest join', (data) => {
        $('#numUsers').html("participants: " + data.numUsers + " - total viewers: " + data.numGuests);
    })

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {
        $('#info').html('<p>' + data.username + ' left</p>')
        $('#numUsers').html("participants: " + data.numUsers + " - total viewers: " + data.numGuests);
    })

    //Listen on new_message
    socket.on("new_message", (data) => {
        $inputMessage.val('')
        $("#messages").append("<p class='message'>" + data.username + ": " + data.message + "</p>")
        $("#messages")[0].scrollTop = $("#messages")[0].scrollHeight
    })

    //Listen on typing
    socket.on('typing', (data) => {
        $('#info').html("<p class='typing'><i>" + data.username + " is typing a message..." + "</i></p>")
    })

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', () => {
        $('#info .typing').fadeOut(function() {
            $(this).remove();
        });
    });
});