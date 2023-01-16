
var map;

function getlocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);

        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        var map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup("Locatie Boeven").openPopup();
    });
}


document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    getlocation();
})