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
        var friend = data.receiver;
        var isMyMsg = true;
        if ($scope.currentUser==data.receiver) {
            friend = data.sender;
            isMyMsg = false;
        }
        if ($("#"+friend+"01").length==0) showPrivateChatBox(friend);
        var pClass = isMyMsg?'right':'left';
        var div = document.createElement('div');
        div.innerHTML='<p class="private-message '+pClass+'">\
                            <span class="username">'+data.sender+':</span>\
                            <span class="text">'+data.msg+'</span>\
                            <span class="timestamp"> ('+data.date+')</span>\
                        </p>';
        console.log(friend);
        $("#"+friend+"01 > .box-body")[0].appendChild(div);
        $("#"+friend+"01 > .box-body")[0].scrollTop=$("#"+friend+"01 > .box-body")[0].scrollHeight;
    });
    // Show private chat box
    $scope.showPrivateChatBox = function(username){
        showPrivateChatBox(username);
    };
    var showPrivateChatBox = function(username){
        div = document.createElement('div');
        div.innerHTML='<div class="private-chat-box" id="'+username+'01">\
                            <div class="box-header">'+username+'</div>\
                            <div class="box-body"></div>\
                            <div class="box-footer form-inline">\
                                <input type="text" name="message" placeholder="Type Message ..." class="form-control" ng-model="privateMessage">\
                                <button type="button" class="btn btn-primary btn-flat" ng-click="sendPrivateMessage(\''+username+'\',privateMessage)">Send</button>\
                            </div>\
                    </div>';
        $compile(div)($scope);
        $('.user-box').parent()[0].appendChild(div);
    };
    $scope.sendPrivateMessage = function(username, msg){
        console.log($scope.currentUser+" send a private messsage to "+username+": "+msg);
        socket.emit('privateMessage', {username:username,msg:msg,date:getDate()});
        $scope.privateMessage=null;
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
                            <span class="timestamp"> ('+getDate()+')</span>\
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
    var getDate=function(){
        monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October","November", "December"];
        date = new Date();
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