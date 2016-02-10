console.log("I am loaded");


var chaloApp = angular.module('chaloApp', []);

chaloApp.controller('mainController', ['$scope', '$http', function($scope, $http){

$scope.searchCity = "jaipur";
$scope.foursquareUrl =
"https://api.foursquare.com/v2/venues/explore?client_id=EIR1HCFZRCQQPUGTFS4ZEIGX44RRQOK3ICF2554OAISV5OBG&client_secret=G4O1UGHQQ3GP42LAARTBISE0PPQE2SPZMP4L5FEWTEAKTAIZ&v=20160101&radius=100&section=topPicks&near="
+ $scope.searchCity
$scope.places= [];

$scope.getPlaces = function(){
  $http.get($scope.foursquareUrl).then(function(response){
    $scope.places = response.data.response.groups[0].items;
    console.log($scope.places);
    });
};
$scope.getPlaces();

}]);
