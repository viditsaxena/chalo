console.log("app.js am loaded");


var chaloApp = angular.module('chaloApp', ['ngCookies', 'ngRoute', 'ngMessages']);

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
        console.log(response.data)
        $scope.users.push(response.data);
        // $scope.newUser = {};
        $scope.instantLogin();
        // $location.path('/login');
      });
    };
    $scope.instantLogin = function(){
      $http.post("/api/users/authentication_token", $scope.newUser).then(function(reponse){
        $rootScope.token = reponse.data.token;
        console.log($rootScope.token);
        $cookies.put('token', $rootScope.token);
        $cookies.put('logInUserId', reponse.data.id);
        $scope.newUser = {};
        $location.path('/')
      });
    };


    $scope.obtainToken = function(){
      $http.post("/api/users/authentication_token", $scope.logInUser).then(function(reponse){
        console.log(reponse.data);
        $rootScope.token = reponse.data.token;
        console.log($rootScope.token);
        $cookies.put('token', $rootScope.token);
        $cookies.put('logInUserId', reponse.data.id);
        console.log($cookies.get('logInUserId'));
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

chaloApp.controller('planController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$compile', function($scope, $rootScope, $http, $cookies, $location, $compile){

  var logInUserId = $cookies.get('logInUserId')
  $scope.newPlan = {title:'', userId: logInUserId}
  var currentTitle = $cookies.get('currentTitle')
  $scope.showPlan = {title: currentTitle, userId: logInUserId, spots:[{}]}
  $scope.currentUserPlans = [];
  $scope.plans = [];
//From the Google Autofill object in initializeMap Function
  $scope.place = {};
  console.log($scope.place);

  $scope.getPlans = function(){
    $http.get('/api/plans').then(function(response){
      $scope.plans = response.data;
    });
  }
  $scope.getPlans();


  $scope.getCurrentUserPlans = function(){

    var url = '/api/plans/search?userId=' + logInUserId;
    $http.get(url).then(function(response){
      $scope.currentUserPlans = response.data;
    });
  }
  $scope.getCurrentUserPlans();

  $scope.addPlan = function(){
    $http({
      url: '/api/plans',
      method: 'post',
      headers:{
        token: $rootScope.token
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

  $scope.addSpot = function(){
    $scope.showPlan.spots.push($scope.place);
    $scope.addSpotToDatabase();
  };

  $scope.addSpotToDatabase = function(){
        var plan = $scope.showPlan;
        var id = $cookies.get('currentPlanId')
        var url = '/api/plans/' + id;
        $http.patch(url, plan).then(function(response){
          console.log(response.data);
            $scope.showPlan = response.data;
        });
  }

  $scope.getOnePlan = function(){
    var id = $cookies.get('currentPlanId')
    var url = '/api/plans/' + id;

    $http.get(url).then(function(response){
      $scope.showPlan = response.data;
      });
  }
  $scope.getOnePlan();




  $scope.initializeMap = function() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -33.8688, lng: 151.2195},
      zoom: 13
    });


    // AUTO-COMPLETE
    var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);





    // INFO-WINDOW
    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });





    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      $scope.place = autocomplete.getPlace();
      console.log($scope.place);
      if (!$scope.place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if ($scope.place.geometry.viewport) {
        map.fitBounds($scope.place.geometry.viewport);
      } else {
        map.setCenter($scope.place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: $scope.place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition($scope.place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if ($scope.place.address_components) {
        address = [
          ($scope.place.address_components[0] && $scope.place.address_components[0].short_name || ''),
          ($scope.place.address_components[1] && $scope.place.address_components[1].short_name || ''),
          ($scope.place.address_components[2] && $scope.place.address_components[2].short_name || '')
        ].join(' ');
      }

      var contentString = '<div><strong>' + $scope.place.name + '</strong><br>' + address + ' <br><button class="btn btn-success" ng-click="addSpot()">Add this Spot</button>';
      var compiled = $compile(contentString)($scope);

      infowindow.setContent(compiled[0]);
      infowindow.open(map, marker);

    });

  } // Initialize Map ends here.

}]);
