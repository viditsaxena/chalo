// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gMap', ['$rootScope', '$http', '$compile', '$cookies', function($rootScope, $http, $compile, $cookies){

      // Initialize Variables
             // -------------------------------------------------------------
             $rootScope.token = $cookies.get('token');
             // Service our factory will return
             var googleMapService = {};
             $rootScope.placeId = ''; //for line 106
             // Array of locations obtained from API calls
             var locations = [];

             // Functions
             // --------------------------------------------------------------
             // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
             googleMapService.refresh = function(){

                 // Clears the holding array of locations
                 locations = [];

                 // Perform an AJAX call to get all of the records in the db.
                 var id = $cookies.get('currentPlanId')


                 var url = '/api/plans/' + id;

                 $http({
                   url: url,
                   method: 'get',
                   headers:{
                     'x-access-token': $rootScope.token
                   }
                 }).then(function(response){
                     // Convert the results into Google Map Format
                     locations = convertToMapPoints(response.data.spots);

                     // Then initialize the map.
                     initializeMap();
                 })
             };

             var convertToMapPoints = function(spots){

                     var locations = [];

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
            

                         var contentString = '<div class = "info-window"><strong>' + spot.name + '</strong><br>' + ' <br><button class="btn btn-default" ng-click="getMarkerDetails()">More Details</button>';
                         var compiled = $compile(contentString)($rootScope);

                        //  infowindow.setContent(compiled[0]);

                         // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                         locations.push({
                             latlon: new google.maps.LatLng(spot.geometry.location.lat, spot.geometry.location.lng),
                             message: new google.maps.InfoWindow({
                                 content: compiled[0],
                                 maxWidth: 320
                             }),
                             name: spot.name,
                             placeId: spot.place_id
                         });
                     }
                     // location is now an array populated with records in Google Maps format
                     return locations;
             };

             function initializeMap () {

               // If map has not been created already...
               if (!map){
                   // Create a new map and place in the index.html page
                     var map = new google.maps.Map(document.getElementById('map'), {
                     center: $rootScope.mapCenter,
                     zoom: 2
                   });
               }
               var bounds = new google.maps.LatLngBounds();

               // Loop through each location in the array and place a marker
               locations.forEach(function(n, i){
                   var position = n.latlon;
                   bounds.extend(position);
                   var marker = new google.maps.Marker({
                       position: position,
                       map: map,
                       title: "Big Map",
                       icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                   });

                   // For each marker created, add a listener that checks for clicks
                   google.maps.event.addListener(marker, 'click', function(e){

                     $rootScope.placeId = n.placeId
                       // When clicked, open the selected marker's message
                       currentSelectedMarker = n;
                       n.message.open(map, marker);
                   });
                   // Automatically center the map fitting all markers on the screen
                     map.fitBounds(bounds);
               });



               var input = /** @type {!HTMLInputElement} */(
                   document.getElementById('pac-input'));

               var types = document.getElementById('type-selector');
              //  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
               // map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

               var autocomplete = new google.maps.places.Autocomplete(input);
              //  Use bindTo() to bias the results to the map's viewport, even while that viewport changes.
              autocomplete.bindTo('bounds', map);


              //  service = new google.maps.places.PlacesService(map);


               // INFO-WINDOW
               var infowindow = new google.maps.InfoWindow();
               var marker = new google.maps.Marker({
                 map: map,
                 anchorPoint: new google.maps.Point(0, -29)
               });


               autocomplete.addListener('place_changed', function() {
                 infowindow.close();
                 marker.setVisible(false);
                 $rootScope.place = autocomplete.getPlace();
                 console.log($rootScope.place );
                 $rootScope.spot = {name:$rootScope.place.name, place_id:$rootScope.place.place_id, geometry:$rootScope.place.geometry}
                 console.log($rootScope.spot);

                 if (!$rootScope.place.geometry) {
                   window.alert("Autocomplete's returned place contains no geometry");
                   return;
                 }
                 map.fitBounds(bounds);
                //  If the place has a geometry, then present it on a map.
                //  if ($rootScope.place.geometry.viewport) {
                //    map.fitBounds($rootScope.place.geometry.viewport);
                //  } else {
                //    map.setCenter($rootScope.place.geometry.location);
                //    map.setZoom(5);  // Why 17? Because it looks good.
                //  }
                 marker.setIcon(/** @type {google.maps.Icon} */({
                   url: $rootScope.place.icon,
                   size: new google.maps.Size(71, 71),
                   origin: new google.maps.Point(0, 0),
                   anchor: new google.maps.Point(17, 34),
                   scaledSize: new google.maps.Size(35, 35)
                 }));
                 marker.setPosition($rootScope.place.geometry.location);
                 marker.setVisible(true);

                 var address = '';
                 if ($rootScope.place.address_components) {
                   address = [
                     ($rootScope.place.address_components[0] && $rootScope.place.address_components[0].short_name || ''),
                     ($rootScope.place.address_components[1] && $rootScope.place.address_components[1].short_name || ''),
                     ($rootScope.place.address_components[2] && $rootScope.place.address_components[2].short_name || '')
                   ].join(' ');
                 }

                 var contentString = '<div class = "info-window"><strong>' + $rootScope.place.name + '</strong><br>' + address + ' <br><button class="btn btn-success" ng-click="addSpot()">Add this Spot</button>';
                 var compiled = $compile(contentString)($rootScope);

                 infowindow.setContent(compiled[0]);
                 infowindow.open(map, marker);

                 });

             }

            return googleMapService;


}]);
