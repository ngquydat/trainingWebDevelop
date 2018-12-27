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

app.controller('loginController',['$scope','socket','$http','$state',function($scope,socket,$http,$state){
    console.log('loginController');
    // Listen currentUser
    socket.on('currentUser', function(currentUser){
        $scope.currentUser = currentUser;
        console.log("Get currentUser : "+$scope.currentUser);
    });

    // call API /register to execute FORM REGISTER
    // call API /login to execute FORM LOGIN
}]);

app.controller('mypageController',['$scope','socket','$http',function($scope,socket,$http){
    console.log('mypageController');

    // Listen currentUser
    // Listen userList
    // Listen friendList
    // Listen onlineList
    // Listen private messages
    // Listen group messages
    // Listen friend request confirm
    // Listen friend established

    // call API /friend_request to execute FORM FRIEND_REQUEST
    // call API /friend_request/confirm to execute FORM FRIEND_REQUEST_CONFIRM
}]);