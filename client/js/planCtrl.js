var planCtrl = angular.module('planCtrl', ['geolocation']);

planCtrl.controller('planController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$compile', '$uibModal', 'geolocation',  function($scope, $rootScope, $http, $cookies, $location, $compile, $uibModal, geolocation){

    $scope.newPlan = {title:'', userId: logInUserId}
    $scope.currentUserPlans = [];
    $scope.plans = [];

    var logInUserId = $cookies.get('logInUserId')
    var currentTitle = $cookies.get('currentTitle')
    $scope.showPlan = {title: currentTitle, userId: logInUserId, spots:[{}]}
    //From the Google Autofill object in initializeMap Function
    $scope.place = {};
    //Only some of things to be added to the DB. Too much comes back from Google to be storing in your own DB.
    $scope.spot = {};
    //the object which holds the getDetails method call response from Google
    $scope.spotDetails = {};
    var service;
    $scope.locations = [];





  //This is for show page when user clicks on a spot, We should get details from Google.
   $scope.getSpotDetails = function(spot){
      var request = {
        placeId: spot.place_id
      };

      service.getDetails(request, callback);

      function callback(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.spotDetails = place;
          console.log($scope.spotDetails);

          var modalInstance = $uibModal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              spotDetails: function () {
                return $scope.spotDetails;
              }
            }
          });
        }
      }

   };




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

  //When user clicks on the button in an info window.
  $scope.addSpot = function(){
    //push that spot in the showPlan object that holds all the info about the plan.
    $scope.showPlan.spots.push($scope.spot);
    //call the function that updates the database for that plan
    $scope.addSpotToDatabase();
  };

  //function that updates the database anytime a new spot is added.
  $scope.addSpotToDatabase = function(){
        //get the latest info on a plan.
        var plan = $scope.showPlan;
        //get the plan ID so we can send it to the right route.
        var id = $cookies.get('currentPlanId')
        var url = '/api/plans/' + id;
        $http.patch(url, plan).then(function(response){
            $scope.showPlan = response.data;
            $scope.refresh();
        });
  }
  //This is for myPlans or Browse Plans section, when user clicks on a plan.
  $scope.selectOnePlan = function(plan){
    //remove whatever is stored in cookies
    $cookies.remove('currentPlanId');
    console.log(plan);
    //put the id of the plan clicked in the cookies.
    $cookies.put('currentPlanId', plan._id);
    //call the function that queries for a plan from the database using plan id.
    $scope.getOnePlan();
  }


  //Function that sends a query to the database for a plan based on plan ID.
  $scope.getOnePlan = function(){
    //get the id of the plan in context from the cookies.
    var id = $cookies.get('currentPlanId')
    var url = '/api/plans/' + id;

    $http.get(url).then(function(response){
        //Put the returning plan in an object on the scope so we can use two way binding to show it on the view.
        $scope.showPlan = response.data;
        $scope.refresh();
    });
  }
  //On refresh this will bring the plan back from the database.
  $scope.getOnePlan();

// -----------------------------------------------------------------------------

  $scope.refresh = function(){

            var spots = $scope.showPlan.spots;
            $scope.convertToMapPoints(spots);

            $scope.initializeMap();

      };

      // Private Inner Functions
      // --------------------------------------------------------------
      // Convert a JSON of users into map points
  $scope.convertToMapPoints = function(spots){

          // Clear the locations holder
          $scope.locations = [];

          // Loop through all of the JSON entries provided in the response
          for(var i= 0; i < spots.length; i++) {
              var spot = spots[i];

              // Create popup windows for each record
              // var  contentString =
              //     '<p><b>Username</b>: ' + user.username +
              //     '<br><b>Age</b>: ' + user.age +
              //     '<br><b>Gender</b>: ' + user.gender +
              //     '<br><b>Favorite Language</b>: ' + user.favlang +
              //     '</p>';

              // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
              $scope.locations.push({
                  latlon: new google.maps.LatLng(spot.geometry.location.lat, spot.geometry.location.lng),
                  message: new google.maps.InfoWindow({
                      content: "Content will be coming soon",
                      maxWidth: 320
                  }),
                  name: spot.name,
                  placeId: spot.place_id
              });
          }
  };



//------------------------------------------------------------------------------


  $scope.initializeMap = function() {

    // If map has not been created already...
    if (!map){
        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 34.5133, lng: -94.1629},
          zoom: 2
        });
    }


    // Loop through each location in the array and place a marker
    $scope.locations.forEach(function(n, i){
        var marker = new google.maps.Marker({
            position: n.latlon,
            map: map,
            title: "Big Map",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = n;
            n.message.open(map, marker);
        });
    });



    // AUTO-COMPLETE
    var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);


    service = new google.maps.places.PlacesService(map);



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
      $scope.spot = {name:$scope.place.name, place_id:$scope.place.place_id, geometry:$scope.place.geometry}
      console.log($scope.spot);

      if (!$scope.place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if ($scope.place.geometry.viewport) {
        map.fitBounds($scope.place.geometry.viewport);
      } else {
        map.setCenter($scope.place.geometry.location);
        map.setZoom(12);  // Why 17? Because it looks good.
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


planCtrl.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, spotDetails) {

  $scope.spotDetails = spotDetails;


  $scope.ok = function () {
    $uibModalInstance.close();
  };

});
