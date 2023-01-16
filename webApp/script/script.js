
var map;

function showMap() {
    navigator.geolocation.getCurrentPosition(function (position) {
        var map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        var greenIcon = L.icon({
            iconUrl: '../assets/map_marker.png',

            iconSize: [35, 47], // size of the icon
            //iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -15] // point from which the popup should open relative to the iconAnchor
        });

        var marker = L.marker([50.83080623727818, 3.2633155115745267], { icon: greenIcon }).addTo(map);
        marker.bindPopup("Locatie Boeven").openPopup();



        navigator.geolocation.watchPosition(function (position) {
            console.log(position.coords.latitude);
            console.log(position.coords.longitude);

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            var ownIcon = L.icon({
                iconUrl: '../assets/live_location.png',

                iconSize: [25, 25], // size of the icon
            });

            if (!OwnLocation) {
                var OwnLocation = L.marker([lat, lon], { icon: ownIcon }).addTo(map);
            }
            else {
                OwnLocation.setLatLng([lat, lon]);
            }
        });
    });
}



document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    showMap();
})