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

app.controller('mypageController',['$scope','socket','$http','$state',function($scope,socket,$http,$state){
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