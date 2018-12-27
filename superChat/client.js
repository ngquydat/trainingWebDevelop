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

    // call API /register to execute FORM REGISTER
    $scope.register = function() {
        registerUrl = 'http://'+location.host+'/register';
        console.log($scope.newUser);
        $http({method:'POST', url:registerUrl, data:$scope.newUser}).then(
            function(data){
                console.log('regist success');
            },
            function(err){
                console.log('regist error');
            }
        );
    }
    // call API /login to execute FORM LOGIN
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
    // Listen friendList
    // Listen onlineList
    // Listen private messages
    // Listen group messages
    // Listen friend request confirm
    // Listen friend established

    // call API /friend_request to execute FORM FRIEND_REQUEST
    // call API /friend_request/confirm to execute FORM FRIEND_REQUEST_CONFIRM
    $scope.Logout = function() {
        $state.go('beforeLogin');
    }
}]);