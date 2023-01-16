
var map;

function getlocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        var map = L.map('map').setView([lat, lon], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        var greenIcon = L.icon({
            iconUrl: '../assets/map_marker.png',

            iconSize: [35, 47], // size of the icon
            //iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            popupAnchor: [20, 0] // point from which the popup should open relative to the iconAnchor
        });

        var marker = L.marker([50.83080623727818, 3.2633155115745267], { icon: greenIcon }).addTo(map);
        marker.bindPopup("Locatie Boeven").openPopup();

        var OwnLocation = L.marker([lat, lon],).addTo(map);
    });
}


document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    getlocation();
})