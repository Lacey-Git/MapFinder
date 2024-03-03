// Get references to HTML elements
const xCoords = document.getElementById('x-coordinates');
const yCoords = document.getElementById('y-coordinates');
const button = document.getElementById('btn');
const querries = document.getElementById('querries');
const inputs = document.getElementById('inputs');
var msg = document.getElementById('msg');
const button_menu = document.getElementById('menu-btn');
const searchbtn = document.querySelectorAll('.bton-search');
var marker = new Array();
var mapbox = document.getElementById('map');
var searchInput = document.querySelectorAll('.search_input')
var polylines = new Array();
var marker_new = new Array();

// Initial latitude and longitude values
var lat = 0.02;
var long = 36.90;
var result ;
var query_location ;


// Define maps

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});


var St = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

var Th= L.tileLayer('https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: '10f74536e8ee47b29dc4ac6137a0b533',
	maxZoom: 22
});


var Esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});




console.log(searchbtn)
 // Creates a red marker with the coffee icon
 var redMarker = L.AwesomeMarkers.icon({
    icon: 'fa-solid fa-square-parking',
    prefix: 'fa', 
    markerColor: 'blue'
  });

function createPopups(lat,long){
  
    // Fetch reverse geocoding information and country details using Geoapify and Restcountries APIs
    fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}&api_key=658eee18a9d00961635940cisab19fd`)
    .then(response => response.json())
    .then(data =>{
          result = data.display_name
          country_result = data.address.country
          console.log(data)
          console.log(country_result)
          fetch(`https://restcountries.com/v3.1/name/${country_result}?fullText=true`)
          .then(response => response.json())
          .then(data=> {
            console.log(data)
            // Create a popup with location and country information
            var popup = L.popup()
            .setLatLng([lat,long])
            .setContent(`<h5><b>${result}</b></h5>
                          <br /> 
                          <h6>Country: ${country_result}</h6>
                          <p>
                          <b>Population</b>: ${data[0].population}
                          <br />
                          <b>Area</b>: ${data[0].area}
                          </p>`)
            .openOn(map);    })
          })
}



button_menu.addEventListener('click',()=>{
    console.log('buton clicked')
    querries.style.display = 'block';
    // mapbox.style.marginTop= '200px';
    inputs.classList.remove('slide-animation');
    inputs.classList.add('reverse-slide-animation');
    mapbox.classList.remove('slide-animationMarginTop');
    mapbox.classList.add('reverse-slide-animationMarginTop');
})


searchbtn.forEach((button)=>{
button.addEventListener('click',()=>{
    console.log('searching ...')

     searchInput.forEach((query)=>{
        if (query.value != "")
            {
                
               query_location = query.value


                console.log(query_location)

                try{
                    fetch(`https://us1.locationiq.com/v1/search?key=pk.e7c1a5b1ef38da5e042a61139a63a56b&q=${query_location}&format=json&`)
                    .then(response => response.json())
                    .then(data =>{
                            console.log('data:', data)

                            var lat = data[0].lat;
                            var long = data[0].lon;

                        map.setView([lat,long],12);
                        query_location.value
                    })
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
             
            })

        })
})

// Event listener for button click
button.addEventListener('click', () => {
    // Update latitude and longitude from input values
    long = xCoords.value;
    lat  = yCoords.value;
    // Clear input fields
    xCoords.value = "";
    yCoords.value = "";

    createPopups(lat,long)
    // Pan the map to the new coordinates and add a marker
    map.panTo(new L.LatLng(lat, long), {
        Zoom: 6.1,
    });
    L.marker([lat,long]).addTo(map);
    // Update message to display the new coordinates
    msg.innerHTML = `The coordinates are now:</br> latitude: ${lat}°</br>longitude: ${long}°`;
});

// Initialize Leaflet map
var map = L.map('map').setView([lat, long], 6.1);

var CartoDB_Voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

var basemaps = {
    'carto': CartoDB_Voyager,
    'Stamen_Lite': St,
    'osm': osm,
    'Thunder Forest': Th,
    'Esri': Esri,
}

L.control.layers(basemaps).addTo(map)
L.control.scale().addTo(map);

// Function to round a number to specified digits
function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if (n < 0) {
        negative = true;
        n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(digits);
    if (negative) {
        n = (n * -1).toFixed(digits);
    }
    return n;
}

// Event listener for map click
map.on('click', function(e) {       
    var screenWidthCheck = window.innerWidth 
    if (screenWidthCheck < 768){
        querries.style.display = 'none';
        inputs.style.height='180px';
        inputs.classList.remove("reverse-slide-animation")
        inputs.classList.add('slide-animation');
        mapbox.classList.remove('reverse-slide-animationMarginTop');
        mapbox.classList.add('slide-animationMarginTop');
    }

    var popLocation= e.latlng;
    var lat = roundTo(popLocation.lat,2);
    var long = roundTo(popLocation.lng,2);
    // Round latitude and longitude to 2 decimal places
            console.log(popLocation)    
            createPopups(lat,long)
            radius = 2500;
            const query = `[out:json];
                (
                    node(around:${radius},${lat},${long})["amenity"="parking"];
                );
                out body;
                >;
                out skel qt;`;


            try {
                // Send the query to the Overpass API
                 fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    body: query,
                })
                .then(response => response.json())
                .then( data =>{

                    console.log('tours Data',data);
                    // Remove existing markers from the map
                    marker.forEach(mark => {
                        map.removeLayer(mark);
                    });
                    marker = []; // Clear the marker array
                    
                    // Add new markers from fetched data
                    data.elements.forEach(element => {
                        console.log("overpass result", element);
                        var lat1 = element.lat;
                        var long1 =element.lon;
                        
                        function toNumberString(num) { 
                            if (Number.isInteger(num)) { 
                              return num + ".0"
                            } else {
                              return num.toString(); 
                            }
                          }

                        
                        
                        console.log("long: ",typeof(long))
                        var currentMarker = new L.marker([lat1, long1],{icon: redMarker}).addTo(map).on('click', function(e) {
                            function navigate(){
                                long = toNumberString(long);
                                lat = toNumberString(lat);
                                long1 = toNumberString(long1);
                                lat1 = toNumberString(lat1);


                                const startCoords = `${long},${lat}`;
                                const endCoords = `${long1},${lat1}`;
                                const apiKey = '5b3ce3597851110001cf6248336a725ce6af473da9c418c23e073c72';
                                
                                const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords}&end=${endCoords}`;
                                
                                const headers = {
                                  'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
                                };
                                
                                fetch(url, {
                                  method: 'GET',
                                  headers: headers
                                })
                                .then(response => {
                                  if (response.status === 200) {
                                   return response.json();
                                  } else {
                                    throw new Error('Failed to fetch directions');
                                  }
                                })
                                .then(data => {
                                  console.log(data);
                                  pointlist_converted= []
                                    data.features[0].geometry.coordinates.forEach(data_piece =>{
                                        var list = [data_piece[1],data_piece[0]]
                                        pointlist_converted.push(list)
                                    })

                                    var greenIcon = L.icon({
                                        iconUrl: 'https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-green.png?raw=true', // URL to your green icon image
                                        shadowUrl: 'https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-shadow.png?raw=true', // URL to the shadow image (optional)
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        shadowSize: [41, 41]
                                    });

                                    var active_marker = new L.marker([lat,long],{icon: greenIcon }).addTo(map);
                                    
                                    function featureRemover(){
                                        for (let i = 0; i < arguments.length; i++) {
                                            console.log(arguments[i])
                                            arguments[i].forEach(argument =>{
                                            map.removeLayer(argument);
                                            })
                                        } 

                                    }

                                    featureRemover(polylines,marker_new) 
                                    
                                    polylines =[ ]
                                    marker_new = []
                                    var active_polyline = new  L.polyline(pointlist_converted, { color: 'red', weight: 3, smoothFactor: 1 }).addTo(map);;

                                   
                                    polylines.push(active_polyline);
                                    active_polyline.addTo(map);

                                    marker_new.push(active_marker);
                                    active_marker.addTo(map);
                                })
                                .catch(error => {
                                  console.error('Error:', error);
                                });
                                
                            }
                            navigate()
                        });
                         
                        marker.push(currentMarker); // Add marker to the array
                        
                        currentMarker.addTo(map); // Add marker to the map
                    });
                });
           
            } catch (error) {
                console.error(error);
            }
            // Update message to display the new coordinates
            msg.innerHTML = `The coordinates are now:</br> latitude: ${lat}°</br>longitude: ${long}°`
      })
     



