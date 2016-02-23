

var chaloApp = angular.module('chaloApp', ['planCtrl', 'geolocation', 'ngCookies', 'ngRoute', 'ngMessages', 'ui.bootstrap']);

chaloApp.config(function($routeProvider){

    $routeProvider

    .when('/', {
      templateUrl: './views/home.html',
      controller: 'homeController'
    })
    .when('/signup', {
      templateUrl: './views/signup.html',
      controller: 'authController'
    })
    .when('/login', {
      templateUrl: './views/login.html',
      controller: 'authController'
    })
    .when('/create', {
      templateUrl: './views/create.html',
      controller: 'planController'
    })
    .when('/plans', {
      templateUrl: './views/plans.html',
      controller: 'planController'
    })
    .when('/show', {
      templateUrl: './views/show.html',
      controller: 'planController'
    })
    .when('/myplans', {
      templateUrl: './views/myplans.html',
      controller: 'planController'
    })
});

chaloApp.controller('authController', ['$scope', '$rootScope', '$http', '$cookies', '$location', function($scope, $rootScope, $http, $cookies, $location){

    $rootScope.token;
    $scope.users = [];
    $scope.newUser = {};
    $scope.logInUser = {};



    $scope.createUser = function(){
      $http.post('/api/users', $scope.newUser).then(function(response){
        $scope.users.push(response.data);
        // $scope.newUser = {};
        $scope.instantLogin();
        // $location.path('/login');
      });
    };
    $scope.instantLogin = function(){
      $http.post("/api/users/authentication_token", $scope.newUser).then(function(reponse){
        $rootScope.token = reponse.data.token;
        $cookies.put('token', $rootScope.token);
        $cookies.put('logInUserId', reponse.data.id);
        $scope.newUser = {};
        $location.path('/')
      });
    };


    $scope.obtainToken = function(){
      $http.post("/api/users/authentication_token", $scope.logInUser).then(function(reponse){
        $rootScope.token = reponse.data.token;
        $cookies.put('token', $rootScope.token);
        $cookies.put('logInUserId', reponse.data.id);
        $location.path('/')
      });
    };
    //This is so if someone refreshes while logged in the rootscope get populated with the cookie token again.
$rootScope.token = $cookies.get('token');

    $scope.logOut = function(){
      $cookies.remove('token');
      $cookies.remove('logInUserId');
      $rootScope.token = $cookies.get('token');
      $scope.logInUser = {};
      $location.path('/')
    };

}]);

chaloApp.controller('homeController', ['$scope', '$rootScope', '$http', '$cookies', '$location', function($scope, $rootScope, $http, $cookies, $location){

}]);
