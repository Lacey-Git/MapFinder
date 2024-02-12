// Get references to HTML elements
const xCoords = document.getElementById('x-coordinates');
const yCoords = document.getElementById('y-coordinates');
const button = document.getElementById('btn');
const querries = document.getElementById('querries');
const inputs = document.getElementById('inputs');
var msg = document.getElementById('msg');
const button_menu = document.getElementById('menu-btn');
var marker = new Array();

// Initial latitude and longitude values
var lat = 0.02;
var long = 36.90;
var result ;

 // Creates a red marker with the coffee icon
 var redMarker = L.AwesomeMarkers.icon({
    icon: 'fa-solid fa-tree',
    prefix: 'fa', 
    markerColor: 'green'
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
    querries.style.display = 'block';
    inputs.classList.remove('slide-animation');
    inputs.classList.add('reverse-slide-animation')
})

// Event listener for button click
button.addEventListener('click', () => {
    // Update latitude and longitude from input values
    lat = xCoords.value;
    long = yCoords.value;
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
                            node(around:${radius},${lat},${long})["leisure"="park"];
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
                        console.log(result);
                        var lat = element.lat;
                        var long =element.lon;
                        
                        var currentMarker = new L.marker([lat, long],{icon: redMarker}).addTo(map);
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
     


// Add OpenStreetMap tile layer to the map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map)
