

function getlocation() {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
    });
}










document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    getlocation();
})