var app = angular.module('myapp', ['ngMaterial','ui.router']);

app.factory('socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();

    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);

app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise('/');
    $stateProvider
    .state('beforeLogin',{
        url:'/',
        views:{
            'body':{
                templateUrl:'/views/login.html',
                controller:'loginController'
            }
        }
    })
    .state('afterLogin',{
        url:'/mypage',
        views:{
            'body':{
                templateUrl:'/views/mypage.html',
                controller:'mypageController'
            }
        }
    })
}]);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

app.controller('loginController',['$scope','$http','$state',function($scope,$http,$state){
    console.log('loginController');
    // get newUser
    $scope.newUser = {
        'username' : '',
        'password' : '',
    };
    // get loginUser
    $scope.loginUser = {
        'username' : '',
        'password' : ''
    };
    // call API /register to execute FORM REGISTER
    $scope.register = function() {
        registerUrl = 'http://'+location.host+'/register';
        console.log($scope.newUser);
        $http({method:'POST', url:registerUrl, data:$scope.newUser}).then(
            function(data){
                if (data.data=="success") console.log('regist success');
                else console.log('regist error: '+data.data);
            },
            function(err){
                console.log('regist error');
            }
        );
    }
    // call API /login to execute FORM LOGIN
    $scope.login = function() {
        loginUrl = 'http://'+location.host+'/login';
        console.log($scope.loginUser);
        $http({method:'POST', url:loginUrl, data:$scope.loginUser}).then(
            function(data){
                if (data.data=="success") {
                    console.log('login success');
                    $state.go('afterLogin');
                } else {
                    console.log('login error: '+data.data);
                }
            },
            function(err){

            }
        );
    }
    //
    $scope.Guest = function() {
        $state.go('afterLogin');
    }
}]);

app.controller('mypageController',['$scope','socket','$http','$state','$compile',function($scope,socket,$http,$state, $compile){
    console.log('mypageController');
    var typing = false
    // typing event
    $("#group-chat-input").bind("keydown keypress", function (event) {
        if (!typing) {
            typing = true
            socket.emit('groupChatTyping')
        }
        lastTypingTime = (new Date()).getTime()

        setTimeout(() => {
            var typingTimer = (new Date()).getTime()
            var timeDiff = typingTimer - lastTypingTime
            if (timeDiff >= 400 && typing) {
                socket.emit('groupChatStopTyping')
                typing = false
            }
        }, 400)
    });
    socket.on('groupChatTyping', function(typingUser){
        if ($scope.currentUser==typingUser) return;
        $('#group-chat-typing').html("<p class='typing'><i>" + typingUser + " is typing a message..." + "</i></p>")
    });
    socket.on('groupChatStopTyping', function(typingUser){
        if ($scope.currentUser==typingUser) return;
        $('#group-chat-typing .typing').fadeOut(function() {
            $(this).remove();
        });
    });
    // Listen currentUser
    socket.on('currentUser', function(currentUser){
        $scope.currentUser = currentUser;
        $scope.$apply();
        console.log("Get currentUser : "+$scope.currentUser);
    });
    // Listen userList
    socket.on('userList', function(data){
        $scope.$apply(function(){
            $scope.users = data;
        });
        console.log(data); //JSON.stringify(data)
    });
    // Listen friendList
    socket.on('friendList', function(data){
        $scope.$apply(function(){
            $scope.friends = data;
        });
        console.log(data);
    });
    // Listen private messages
    socket.on('privateMessage', function(data){
        var chatbox = data.receiver;
        var isMyMsg = true;
        if ($scope.currentUser==data.receiver) {
            chatbox = data.sender;
            isMyMsg = false;
        }
        showPrivateChatBox(chatbox);
        insertPrivateMsg(chatbox, isMyMsg, data);
    });
    var insertPrivateMsg = function(chatbox, isMyMsg, msgData) {
        var pClass = isMyMsg?'right':'left';
        var div = document.createElement('div');
        div.innerHTML='<p class="private-message '+pClass+'">\
                            <span class="username">'+msgData.sender+':</span>\
                            <span class="text">'+msgData.message+'</span>\
                            <span class="timestamp"> ('+getDate(new Date(msgData.date))+')</span>\
                        </p>';
        $("#"+chatbox+"01 > .box-body")[0].appendChild(div);
        $("#"+chatbox+"01 > .box-body")[0].scrollTop=$("#"+chatbox+"01 > .box-body")[0].scrollHeight;
    };
    // Show private chat box
    $scope.showPrivateChatBox = function(username){
        showPrivateChatBox(username);
    };
    var showPrivateChatBox = function(username){
        if ($("#"+username+"01").length > 0) return;
        html='<div class="private-chat-box" id="'+username+'01">\
                <div class="box-header" style="height:26px">'+username+'\
                    <button ng-click="close_chat(\''+username+'\')" class="chat-header-button pull-right" type="button"><i class="glyphicon glyphicon-remove"></i></button>\
                </div>\
                <div class="box-body"></div>\
                <div class="box-footer form-inline">\
                    <input type="text" placeholder="Type Message ..." class="form-control" ng-model="pmMsg'+username+'" my-enter="sendPrivateMessage(\''+username+'\',\'{{pmMsg'+username+'}}\')" style="width:100%">\
                </div>\
            </div>';
        $('#private-chat-area').append(html);
        $compile($('#'+username+'01')[0])($scope);
        socket.emit('showHistoryMessages', {user1:$scope.currentUser,user2:username});
    };
    socket.on('showHistoryMessages', function(data){
        for(var i in data){
            var chatbox = data[i].receiver;
            var isMyMsg = true;
            if ($scope.currentUser==data[i].receiver) {
                chatbox = data[i].sender;
                isMyMsg = false;
            }
            insertPrivateMsg(chatbox, isMyMsg, data[i]);
        }
    });
    // close chatbox
    $scope.close_chat= function(username)
    {
        chat_box=$('#'+username+'01');
        chat_box.remove();
    }
    $scope.sendPrivateMessage = function(username, msg){
        console.log($scope.currentUser+" send a private messsage to "+username+": "+msg);
        socket.emit('privateMessage', {username:username,msg:msg,date:getDate(new Date())});
        $scope["pmMsg"+username]=null;
    };
    // Listen group messages
    socket.on('groupMessage', function(data){
        var div = document.createElement('div');
        var isMyMsg = false;
        if ($scope.currentUser == data.username) isMyMsg = true;
        var pClass = isMyMsg?'right':'left';
        div.innerHTML='<p class="group-message '+pClass+'">\
                            <span class="username">'+data.username+':</span>\
                            <span class="text">'+data.groupMessage+'</span>\
                            <span class="timestamp"> ('+getDate(new Date())+')</span>\
                        </p>';
        document.getElementById("group-messages").appendChild(div);
        document.getElementById("group-messages").scrollTop=document.getElementById("group-messages").scrollHeight;
    });
    // Listen friend request confirm
    // Listen friend established
    // Emit group message
    $scope.sendGroupMessage = function(message){
        socket.emit('groupMessage', message);
        $scope.groupMessage=null;
    };

    // call API /friend_request to execute FORM FRIEND_REQUEST
    // call API /friend_request/confirm to execute FORM FRIEND_REQUEST_CONFIRM
    $scope.Logout = function() {
        $state.go('beforeLogin');
    };
    var getDate=function(date){
        monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October","November", "December"];
        hour=date.getHours();
        period="AM";
        if (hour>12){
            hour=hour%12;
            period="PM";
        }
        form_date=monthNames[date.getMonth()]+" "+date.getDate()+", "+hour+":"+date.getMinutes()+" "+period;
        return form_date;
    }
}]);