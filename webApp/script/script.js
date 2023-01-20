
//***__________ CODE VOOR DE MAP __________***//
var map;
function showMap(lat, long) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var map = L.map('map', { zoomControl: false }).setView([position.coords.latitude, position.coords.longitude], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        var greenIcon = L.icon({
            iconUrl: '../assets/map_marker.png',

            iconSize: [35, 47], // size of the icon
            iconAnchor: [18, 50], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor
        });

        var marker = L.marker([lat, long], { icon: greenIcon }).addTo(map);
        marker.bindPopup("Locatie Boeven").openPopup();

        setInterval(function () {
            fetch('https://registratie.azurewebsites.net/api/games/groep1?')
                .then(response => response.json())
                .then(data => {
                    var newLatLng = new L.LatLng(data[0].BoefLatitude, data[0].BoefLongtitude);
                    marker.setLatLng(newLatLng);
                })
                .catch(error => {
                    // handle any errors that occur
                });

        }, 10000);

        var ownIcon = L.icon({
            iconUrl: '../assets/live_location.png',

            iconSize: [25, 25], // size of the icon
        });

        var OwnLocation = L.marker([position.coords.latitude, position.coords.longitude], { icon: ownIcon }).addTo(map);


        navigator.geolocation.watchPosition(function (position) {
            console.log(position.coords.latitude);
            console.log(position.coords.longitude);

            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            var newLatLng = new L.LatLng(lat, lon);
            OwnLocation.setLatLng(newLatLng);

        });
    });
}


//***__________ API OPROEPEN VAN AZURE EN MAP TONEN__________***//
let getAPI = async (groepsnaam) => {
    // Eerst bouwen we onze url op
    const ENDPOINT = `https://registratie.azurewebsites.net/api/games/${groepsnaam}?`

    // Met de fetch API proberen we de data op te halen.
    const request = await fetch(`${ENDPOINT}`)
    const data = await request.json()
    console.log(data)

    console.log(data[0].BoefLatitude)
    console.log(data[0].BoefLongtitude)

    showMap(data[0].BoefLatitude, data[0].BoefLongtitude);
}




//***__________ LOCATIE VAN DE BOEF UPDATEN __________***//
function updateBoefLocatie() {

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            groep: "groep1",
            BoefLatitude: 50.82426422796548,
            BoefLongtitude: 3.2716387847274545,
            id: "3545be40-b248-499a-a3e0-c4b5e9ecded8"
        })
    };
    fetch('https://registratie.azurewebsites.net/api/games', requestOptions)
        .then(response => response.json())
}


//***__________ NIEUWE GAME MAKEN __________***//
function createNewGame() {

    //groepsnaam opslaan
    var form = document.getElementById("js-createGame");
    var groepsnaam = form.groepsnaam.value;

    //spel code genereren
    var val1 = Math.floor(1000 + Math.random() * 9000);
    var val2 = Math.floor(1000 + Math.random() * 9000);
    var code = `${val1}-${val2}`;

    localStorage.setItem('groepsnaam', groepsnaam);
    localStorage.setItem('spelCode', code);




    //data naar azure db sturen
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            groep: groepsnaam,
            spelcode: code
        })
    };
    fetch('https://registratie.azurewebsites.net/api/games', requestOptions)
        .then(response => response.json())

    window.location.href = "../pages/startenSpelData.html";
}


function showSpelData() {
    const groepsnaam = localStorage.getItem('groepsnaam');
    const spelCode = localStorage.getItem('spelCode');
    document.querySelector('.js-groepsnaam').innerHTML = groepsnaam;
    document.querySelector('.js-spelCode').innerHTML = spelCode;
}

function timeButton() {
    var timeButton = document.querySelector('.js-time_button');
    var timeShow = document.querySelector('.js-time_button_back');
    timeButton.addEventListener('click', function () {
        console.log('click');
        timeButton.classList.remove('u-showing');
        timeButton.classList.add('u-hidden');
        timeShow.classList.remove('u-hidden');
        timeShow.classList.add('u-showing');
    })
}

function timeButtonBack() {
    var timeButton = document.querySelector('.js-time_button');
    var timeShow = document.querySelector('.js-time_button_back');
    timeShow.addEventListener('click', function () {
        console.log('click');
        timeShow.classList.remove('u-showing');
        timeShow.classList.add('u-hidden');
        timeButton.classList.remove('u-hidden');
        timeButton.classList.add('u-showing');
    })
}

function startTimer(durationSeconds, display) {
    var timer = durationSeconds, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = durationSeconds;
        }
    }, 1000);
}




document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    //kijken welke pagina geladen is
    const startenSpelDataPage = document.getElementById('startenSpelData');
    const startCountdown = document.getElementById('startCountdown');

    if (startenSpelDataPage) {
        console.log('SpelStartenData page loaded');
        showSpelData();
    }

    if (startCountdown) {
        console.log('Countdown page loaded');
        var durationSeconds = 60 * 1.5,
            display = document.querySelector('.js-start_countdown');
        startTimer(durationSeconds, display);
    }

    getAPI("groep1");
    // updateBoefLocatie();
    // createNewGame();
    timeButton();
    timeButtonBack();
})