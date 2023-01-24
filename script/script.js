// //***__________ lOTTIE ANIMATION __________***//
function lottieWaiting() {
    var animation = bodymovin.loadAnimation({
        container: document.getElementById('wachtende'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/6cc54f82-cf99-434a-882e-80852d7ee71f/JFwILgbviQ.json'
    })
}

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
                    console.log(error);
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





//***__________ API OPROEPEN VAN AZURE EN MAP TONEN __________***//
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

    return data
}



//***__________ API OPROEPEN VAN AZURE VOOR SPELCODE __________***//
let getSpelCode = async (spelcode) => {
    // Eerst bouwen we onze url op
    const ENDPOINT = `https://jachtseizoenapi.azurewebsites.net/api/games/code/${spelcode}?`

    // Met de fetch API proberen we de data op te halen.
    const request = await fetch(`${ENDPOINT}`)
    const data = await request.json()

    return data
}


//   const spelCodeJoinen = localStorage.getItem('spelCodeJoinen');





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
    fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)
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

    //check als groepsnaam niet leeg is
    if (!groepsnaam) {
        document.querySelector('.js-form-error').innerHTML = "Vul een groepsnaam in";
    } else {
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
        console.log('naar database')
        fetch('https://jachtseizoenapi.azurewebsites.net/api/games?', requestOptions)
            .then(response => response.json())

        setTimeout(()=>{window.location.href = "../pages/startenSpelData.html";}, 200);      
    }

    //hide de error als ze terug typen
    const inputField = document.querySelector('.js-input');
    inputField.addEventListener('focus', (event) => {
        document.querySelector('.js-form-error').innerHTML = "";
    });
}



//***__________ Deelnemers omhoog doen __________***//
let updateDeelnemers = async (spelcode, spelId) => {

    var data = await getSpelCode(spelcode)
    spelers = data[0].aantalSpelers
    nieuweSpelers = spelers + 1

    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: spelId,
            aantalSpelers: nieuweSpelers,
            spelcode: spelcode
        })
    };
    fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)
        .then(response => response.json())
}




//***__________ NIEUWE GAME JOINEN __________***//
let participateGame = async () => {
    const pattern = /^\d{4}-\d{4}$/;

    //spel code opslaan
    var form = document.getElementById("js-participateGame");
    var code = form.spelCode.value;


    localStorage.setItem('spelCodeJoinen', code);

    //spel code controleren + als het ingevuld is
    const result = pattern.test(code);
    if (!code) {
        document.querySelector('.js-form-error').innerHTML = "Vul een code in";
    } else {
        if (!result) {
            document.querySelector('.js-form-error').innerHTML = "De spel code is niet correct";
        } else {
            document.querySelector('.js-form-error').innerHTML = "";
            //verder gaan
            try {
                speldata = await getSpelCode(code)
                console.log(speldata)
                console.log(speldata[0].id)
                updateDeelnemers(code, speldata[0].id)
                setTimeout(()=>{window.location.href = "../pages/wachtenHost.html";}, 200);
            } catch (error) {
                console.log("bestaat niet")
                document.querySelector('.js-form-error').innerHTML = "Spel code bestaat niet";
            }

        } 
    }

    //error message weghalen als ze opnieuw typen
    const inputField = document.querySelector('.js-input');
    inputField.addEventListener('focus', (event) => {
        document.querySelector('.js-form-error').innerHTML = "";
    });


    //auto "-" toevoegen
    document.querySelector('.js-input-spelCode').addEventListener('input', function(e) {
        var foo = this.value.split("-").join("");
        if (foo.length > 0) {
            foo = foo.match(new RegExp('.{1,4}', 'g')).join("-");
        }
        this.value = foo;
    });
    

}






//***__________ CODE EN GROEPSNAAM TONEN __________***//
let showSpelData = async() => {
    const groepsnaam = localStorage.getItem('groepsnaam');
    const spelCode = localStorage.getItem('spelCode');
    document.querySelector('.js-groepsnaam').innerHTML = groepsnaam;
    document.querySelector('.js-spelCode').innerHTML = spelCode;

    // console.log(data)

        setInterval(() => {
        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/${groepsnaam}?`)
        .then(response => {
            console.log(response.data);
            document.querySelector('.js-aantalDeelnemers').innerHTML = response.data[0].aantalSpelers
        })
        .catch(error => {
            axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${spelCode}?`)
            .then(response => {
            if(response.data && response.data[0]){
            document.querySelector('.js-aantalDeelnemers').innerHTML = response.data[0].aantalSpelers
            }
        })
        });
        },1000);


}



//***__________ TIMER AND BUTTON __________***//
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




//***__________ BUTTONS SPELREGELS & LEADERBOARD __________***//
function goToLeaderboard() {
    window.location.href = "/pages/leaderboard.html";
}
function goToSpelregels() {
    window.location.href = "/pages/spelregels.html";
}


//***__________ Synchronized start __________***//
function SynchronizedStart(code){

    setInterval(() => {
        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {
            console.log(response.data);

            if(response.data[0].startSpelkeuze == 1){
                window.location.href = "/pages/spelKeuze.html";
            }
        })
        .catch(error => {
            console.log(error)
        });
        },1000);
}




//***__________ Spel starten naar keuze gaan __________***//
function spelStarten(){

    console.log("updatefunctie")

    const code = localStorage.getItem('spelCode');
    console.log(code)

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {
            console.log("id" + response.data[0].id);

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: response.data[0].id,
                    "timeLimit": response.data[0].timeLimit,
                    "groep": response.data[0].groep,
                    "BoefLatitude": response.data[0].BoefLatitude,
                    "BoefLongtitude": response.data[0].BoefLongtitude,
                    "spelcode": code,
                    "inProgress": response.data[0].inProgress,
                    "startTime": response.data[0].id.startTime,
                    "endTime": response.data[0].id.endTime,
                    "aantalSpelers": response.data[0].id.aantalSpelers,
                    "winner": response.data[0].id.winner,
                    "startSpelkeuze": true,
                    "startSpel": response.data[0].id.startSpel
                })
    };
                fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

                setTimeout(()=>{window.location.href = "/pages/spelKeuze.html";}, 800)
        .then(response => response.json())
        })
        .catch(error => {
            console.log(error)
        });

}






document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    //kijken welke pagina geladen is
    const startenSpelDataPage = document.getElementById('startenSpelData');
    const startCountdown = document.getElementById('startCountdown');
    const map = document.getElementById('mapPage');
    const wachtenHost = document.getElementById('wachtHostPage');

    //functie voor elke pagina laden
    if (startenSpelDataPage) {
        showSpelData();
    }
    if (startCountdown) {
        console.log('Countdown page loaded');
        var durationSeconds = 60 * 1.5, display = document.querySelector('.js-start_countdown');
        startTimer(durationSeconds, display);
    }
    if (map){
        getAPI("groep1");
        // updateBoefLocatie();
        // createNewGame();
        timeButton();
        timeButtonBack();
    }
    if (wachtenHost) {
        const code = localStorage.getItem('spelCodeJoinen');
        document.querySelector('.js-spelCode').innerHTML = code;
        SynchronizedStart(code);
        lottieWaiting();
    }
    // showSpelData();

})