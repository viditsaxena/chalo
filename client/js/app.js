

var chaloApp = angular.module('chaloApp', ['planCtrl', 'gservice', 'ngCookies', 'ngRoute', 'ngMessages', 'ui.bootstrap']);

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
      controller: 'resourcesController'
    })
    .when('/plans', {
      templateUrl: './views/plans.html',
      controller: 'resourcesController'
    })
    .when('/myplans', {
      templateUrl: './views/myplans.html',
      controller: 'resourcesController'
    })
    .when('/show', {
      templateUrl: './views/show.html',
      controller: 'planController'
    })

});

chaloApp.controller('authController', ['$scope', '$rootScope', '$http', '$cookies', '$location', function($scope, $rootScope, $http, $cookies, $location){

    $rootScope.token;
    $scope.users = [];
    $scope.newUser = {};
    $scope.logInUser = {};

    // $scope.hasExtension = false;


    $scope.createUser = function(){
      $http.post('/api/users', $scope.newUser).then(function(response){
        //if a user already exists
          if (!response.data.success){
            alert(response.data.message)
          } else {
            $scope.instantLogin();
          }
      });
    };
    $scope.instantLogin = function(){
      $http.post("/api/users/authentication_token", $scope.newUser).then(function(reponse){
        $rootScope.token = reponse.data.token;
        console.log(reponse.data.token);
        $cookies.put('token', $rootScope.token);
        $cookies.put('logInUserId', reponse.data.id);
        $scope.newUser = {};
        $location.path('/')
      });
    };


    $scope.obtainToken = function(){
      $http.post("/api/users/authentication_token", $scope.logInUser).then(function(response){
        $rootScope.token = response.data.token;
        $cookies.put('token', $rootScope.token);
        console.log($cookies.get('token'));
        $cookies.put('logInUserId', response.data.id);
        //if login is not successful
        if (!response.data.success){
          alert(response.data.message)
        //redirect the user to homepage if the user is successfully logged in.
        } else if ($rootScope.token){
        $location.path('/')
        }
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



      // chrome.runtime.sendMessage('lhodlodalcbclpnhghakojgeedmephak', { message: "version" },
      //   function (reply) {
      //     console.log($scope.hasExtension);
      //       if (reply) {
      //           if (reply.version) {
      //               if (reply.version >= 0) {
      //                   $scope.hasExtension = true;
      //                   console.log($scope.hasExtension);
      //               }
      //           }
      //       }
      //   });

}]);

chaloApp.controller('resourcesController', ['$scope', '$rootScope', '$http', '$cookies', '$location', function($scope, $rootScope, $http, $cookies, $location){

  $scope.currentUserPlans = [];
  $scope.plans = [];
  var logInUserId = $cookies.get('logInUserId');
  $scope.newPlan = {title:'', userId: logInUserId}
  $rootScope.token = $cookies.get('token');
  console.log($rootScope.token);


  $scope.getPlans = function(){
    $http({
      url: '/api/plans',
      method: 'get',
      headers:{
        'x-access-token': $rootScope.token
      }
    }).then(function(response){
      $scope.plans = response.data;
    });
  }
  $scope.getPlans();


  $scope.getCurrentUserPlans = function(){

    var url = '/api/plans/search?userId=' + logInUserId;
    $http({
      url: url,
      method: 'get',
      headers:{
        'x-access-token': $rootScope.token
      }
    }).then(function(response){
      $scope.currentUserPlans = response.data;
    });
  }
  $scope.getCurrentUserPlans();

  $scope.addPlan = function(){
    $http({
      url: '/api/plans',
      method: 'post',
      headers:{
        'x-access-token': $rootScope.token
      },
      data: $scope.newPlan
    }).then(function(response){
      //Get the title and id of the added plan and store it in cookies for use later.
      $cookies.put('currentTitle', response.data.title);
      $cookies.put('currentPlanId', response.data._id);
      $scope.newPlan = {title: '', userId: logInUserId};
      $location.path('/show')
    });
  };

  //This is for myPlans or Browse Plans section, when user clicks on a plan.
  $scope.selectOnePlan = function(plan){
    //remove whatever is stored in cookies
    $cookies.remove('currentPlanId');
    $cookies.remove('currentTitle');

    console.log(plan);
    //put the id of the plan clicked in the cookies.
    $cookies.put('currentPlanId', plan._id);
    // $rootScope.planId = plan._id;
    $cookies.put('currentTitle', plan.title);
    $location.path('/show')

  }



}]);

chaloApp.controller('homeController', ['$scope', '$rootScope', '$http', '$cookies', '$location', function($scope, $rootScope, $http, $cookies, $location){

  $scope.addExtension = function(){
    console.log("adding extension");
    chrome.webstore.install();
  };

}]);
