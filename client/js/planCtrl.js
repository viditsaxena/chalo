var planCtrl = angular.module('planCtrl', ['gservice', 'dndLists']);

planCtrl.controller('planController', ['$scope', '$rootScope', '$http', '$cookies', '$location', '$compile', '$uibModal', 'gMap', function($scope, $rootScope, $http, $cookies, $location, $compile, $uibModal, gMap){


    var currentTitle = $cookies.get('currentTitle');
    $rootScope.showPlan = {}
    //From the Google Autofill object in initializeMap Function
    $rootScope.place = {};
    //Only some of things to be added to the DB. Too much comes back from Google to be storing in your own DB.
    $rootScope.spot = {};
    //the object which holds the getDetails method call response from Google
    $scope.spotDetails = {};
    // $scope.locations = [];
    $rootScope.mapCenter = {lat: 34.5133, lng: -94.1629};

    $rootScope.token = $cookies.get('token');
    $scope.currentDayIndex = 0;
    $rootScope.currentDay = {};
    $rootScope.daySelected = 'all';
    $cookies.put('selectedDay', $rootScope.daySelected);
    $scope.trash = [];
    // $rootScope.customStyle.style = {"color":"black"};

  // This is for show page when user clicks on a spot, We should get details from Google.
   $rootScope.getSpotDetails = function(id){
     console.log(id);
      var request = {
        placeId: id
      };

      var service = new google.maps.places.PlacesService(map);

      service.getDetails(request, callback);

      function callback(place, status) {
        console.log(place);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.spotDetails = place;

          var modalInstance = $uibModal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              spotDetails: function () {
                return $scope.spotDetails;
              }
            }
          });
          gMap.refresh();

        }
      }

   };

   $rootScope.getMarkerDetails = function(){

      var request = {
        placeId: $rootScope.placeId
      };

      var service = new google.maps.places.PlacesService(map);

      service.getDetails(request, callback);

      function callback(place, status) {
        console.log(place);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.spotDetails = place;

          var modalInstance = $uibModal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              spotDetails: function () {
                return $scope.spotDetails;
              }
            }
          });
          gMap.refresh();

        }
      }

   };

  //Function that sends a query to the database for a plan based on plan ID.
  $scope.getOnePlan = function(){
    //get the id of the plan in context from the cookies.
    var id = $cookies.get('currentPlanId')
    var url = '/api/plans/' + id;
    $http({
      url: url,
      method: 'get',
      headers:{
        'x-access-token': $rootScope.token
      }
    }).then(function(response){
        //Put the returning plan in an object on the scope so we can use two way binding to show it on the view.
        $rootScope.showPlan = response.data;
        if ($rootScope.showPlan.days.length === 0) {
          $rootScope.showPlan.days.push( { number: "1", spots:[] } )
        }
        console.log($rootScope.showPlan);
        gMap.refresh();

    });
  }
  // On refresh this will bring the plan back from the database.
  angular.element(document).ready(function () {
        $scope.getOnePlan();
    });


  //When user clicks on the button in an info window.
  $rootScope.addSpot = function(){
    //push that spot in the showPlan object that holds all the info about the plan.
    $rootScope.showPlan.spots.push($rootScope.spot);
    //call the function that updates the database for that plan
    $scope.addSpotToDatabase();
  };

  //function that updates the database anytime a new spot is added.
  $scope.addSpotToDatabase = function(){
        //get the latest info on a plan.
        var plan = $rootScope.showPlan;
        //get the plan ID so we can send it to the right route.
        var id = $cookies.get('currentPlanId')
        var url = '/api/plans/' + id;

        $http({
          url: url,
          method: 'patch',
          headers:{
            'x-access-token': $rootScope.token
          },
          data: plan
        }).then(function(response){
            $rootScope.showPlan = response.data;

            gMap.refresh();

            // $scope.refresh();
        });
  }

  //When user clicks on the button in an info window.
  $rootScope.deleteSpot = function(spot){
    var index = $rootScope.showPlan.spots.indexOf(spot);
    console.log(index);
    //push that spot in the showPlan object that holds all the info about the plan.
    if (index > -1) {
    $rootScope.showPlan.spots.splice(index, 1);
    console.log($rootScope.showPlan.spots);
    }
    //call the function that updates the database for that plan
    $scope.addSpotToDatabase();
  };


  // *************************************************DRAG AND DROP********************************************************
  $scope.models = {
      selected: null,
      lists: {"A": [], "B": []},
      days: {"One": [], "Two": []}

      // days: [{dayNumber: "1", spots:[{}]}, {dayNumber: "2", spots:[{}]} ]
  };





  // *************************************************DRAG AND DROP********************************************************

  $scope.changeDay = function(value){
    if ( value === 'all') {
      $rootScope.daySelected = value;
    } else {
    $rootScope.daySelected = value.number;
    $scope.currentDayIndex = $rootScope.showPlan.days.indexOf(value);

    $rootScope.currentDay = value;
    }
    $cookies.put('selectedDay', $rootScope.daySelected);
    gMap.refresh();
  }

  $scope.moveASpot = function(index){
    $rootScope.showPlan.days[$scope.currentDayIndex].spots.splice(index, 1)
    $scope.addSpotToDatabase();
  }

  $scope.addDay = function(){
  var dayNumber = $rootScope.showPlan.days.length + 1
  $rootScope.showPlan.days.push( { number: dayNumber,  spots:[] } )
  // $scope.addSpotToDatabase();
  }

}]);


planCtrl.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, spotDetails) {
  var imageNumber = 0;
  $scope.spotDetails = spotDetails;
  $scope.photosExist = false;

  if ($scope.spotDetails.hasOwnProperty('photos')){
  $scope.photosExist = true;
  $scope.imgUrl = spotDetails.photos[imageNumber].getUrl({'maxWidth': 300, 'maxHeight': 300})
  }
  $scope.ok = function () {
    $uibModalInstance.close();
  };
  $scope.nextPic = function () {
    imageNumber = imageNumber + 1;
    $scope.imgUrl = spotDetails.photos[imageNumber].getUrl({'maxWidth': 300, 'maxHeight': 300})
  };
  $scope.previousPic = function () {
    imageNumber = imageNumber - 1;
    $scope.imgUrl = spotDetails.photos[imageNumber].getUrl({'maxWidth': 300, 'maxHeight': 300})
  };

});
