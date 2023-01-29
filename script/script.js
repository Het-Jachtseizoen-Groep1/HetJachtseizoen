//***__________ MODAL WINDOW LEADERBOARD __________***//
function modalWindow(){
    setTimeout(function(){
        document.querySelector('.modal').classList.remove("hidden");
    }, 2000);
}

//***__________ lOTTIE ANIMATION __________***//
function lottieWaiting() {
    var animation = bodymovin.loadAnimation({
        container: document.getElementById('wachtende'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/6cc54f82-cf99-434a-882e-80852d7ee71f/JFwILgbviQ.json'
    })
}
function lottieCountDown() {
    var animation = bodymovin.loadAnimation({
        container: document.getElementById('countDown'),
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'https://lottie.host/b8d10e0c-3c61-4d2b-98e4-515d38921c98/yLwXSqm6BT.json'
    })
}



//***__________ CODE VOOR DE MAP JAGER__________***//
var map;
function showMap(lat, long) {

    const code = localStorage.getItem('spelCode');
    console.log("code" + " " + code)
    const durationLocation = localStorage.getItem('durationLocation');

    console.log("duration" + " " + durationLocation)

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
            fetch(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
                .then(response => response.json())
                .then(data => {
                    var newLatLng = new L.LatLng(data[0].BoefLatitude, data[0].BoefLongtitude);
                    marker.setLatLng(newLatLng);

                    console.log("marker verplaatst")
                })
                .catch(error => {
                    // handle any errors that occur
                    console.log(error);
                });

        }, durationLocation * 1000);

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



//***__________ CODE VOOR DE MAP BOEF__________***//
var map;
function showMapBoef() {

    const code = localStorage.getItem('spelCode');
    const durationLocation = localStorage.getItem('durationLocation');

    navigator.geolocation.getCurrentPosition(function (position) {
        var map = L.map('map', { zoomControl: false }).setView([position.coords.latitude, position.coords.longitude], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

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
                "groep": groepsnaam,
                "spelcode": code
            })
        };
        console.log('naar database')
        fetch('https://jachtseizoenapi.azurewebsites.net/api/games?', requestOptions)
            .then(response => response.json())

        setTimeout(() => { window.location.href = "../pages/startenSpelData.html"; }, 500);
    }

    //hide de error als ze terug typen
    const inputField = document.querySelector('.js-input');
    inputField.addEventListener('focus', (event) => {
        document.querySelector('.js-form-error').innerHTML = "";
    });
}



//***__________ Deelnemers omhoog doen in db __________***//
function updateDeelnemers(spelcode){

    console.log(spelcode);

        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${spelcode}?`)
        .then(response => {

            spelers = response.data[0].aantalSpelers;
            nieuweSpelers = spelers + 1;

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "id": response.data[0].id,
                    "timeLimit": response.data[0].timeLimit,
                    "groep": response.data[0].groep,
                    "BoefLatitude": response.data[0].BoefLatitude,
                    "BoefLongtitude": response.data[0].BoefLongtitude,
                    "spelcode": spelcode,
                    "inProgress": response.data[0].inProgress,
                    "startTime": response.data[0].startTime,
                    "endTime": response.data[0].endTime,
                    "aantalSpelers": nieuweSpelers,
                    "winner": response.data[0].winner,
                    "startSpelkeuze": response.data[0].startSpelkeuze,
                    "startSpel": response.data[0].startSpel,
                    "startTimeJs": response.data[0].startTimeJs,
                    "endTimeJs": response.data[0].endTimeJs,
                    "gespeeldeTijd": response.data[0].gespeeldeTijd
                })
            };
            fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

            setTimeout(() => { window.location.href = "../pages/wachtenHost.html"; }, 200);
        })
        .catch(error => {
            console.log("bestaat niet")
            document.querySelector('.js-form-error').innerHTML = "Spel code bestaat niet";
        });
}



//***__________ NIEUWE GAME JOINEN __________***//
function participateGame(){
    const pattern = /^\d{4}-\d{4}$/;

    //spel code opslaan
    var form = document.getElementById("js-participateGame");
    var code = form.spelCode.value;


    localStorage.setItem('spelCode', code);

    //spel code controleren + als het ingevuld is
    const result = pattern.test(code);

    //check als code niet leeg is
    if (!code) {
        document.querySelector('.js-form-error').innerHTML = "Vul een code in";
    } else {
        if (!result) {
            document.querySelector('.js-form-error').innerHTML = "De spel code is niet correct";
        } else {
            document.querySelector('.js-form-error').innerHTML = "";
            //verder gaan
            try {
                updateDeelnemers(code)
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
}



//***__________ "-" TOEVOEGEN AUTOMATISCH BIJ SPELCODE INVULLEN __________***//
function addDash() {
    document.querySelector('.js-input-spelCode').addEventListener('input', function (e) {
        var foo = this.value.split("-").join("");
        if (foo.length > 0) {
            foo = foo.match(new RegExp('.{1,4}', 'g')).join("-");
        }
        this.value = foo;
    });
}



//***__________ CODE EN GROEPSNAAM TONEN WANNEER HOST WACHT OP DEELNEMERS __________***//
let showSpelData = async () => {
    const groepsnaam = localStorage.getItem('groepsnaam');
    const spelCode = localStorage.getItem('spelCode');
    document.querySelector('.js-groepsnaam').innerHTML = groepsnaam;
    document.querySelector('.js-spelCode').innerHTML = spelCode;

    setInterval(() => {
        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/${groepsnaam}?`)
            .then(response => {
                document.querySelector('.js-aantalDeelnemers').innerHTML = response.data[0].aantalSpelers
                
                const aantalSpelers = response.data[0].aantalSpelers;

                if (aantalSpelers == 1) {
                    document.querySelector('.js-woordDeelnemers').innerHTML = "deelnemer";
                } else {
                    document.querySelector('.js-woordDeelnemers').innerHTML = "deelnemers";
                }

            })
            .catch(error => {
                axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${spelCode}?`)
                    .then(response => {
                        if (response.data && response.data[0]) {
                            document.querySelector('.js-aantalDeelnemers').innerHTML = response.data[0].aantalSpelers
                        }

                        const aantalSpelers = response.data[0].aantalSpelers;
                        if (aantalSpelers == 1) {
                            document.querySelector('.js-woordDeelnemers').innerHTML = "deelnemer";
                        } else {
                            document.querySelector('.js-woordDeelnemers').innerHTML = "deelnemers";
                        }
                    })
            });
    }, 1000);
}



//***__________ TIMER AND BUTTON __________***//
function timeButton() {
    var timeButton = document.querySelector('.js-time_button');
    var timeShow = document.querySelector('.js-time_button_back');

    timeButton.addEventListener('click', function () {
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
        timeShow.classList.remove('u-showing');
        timeShow.classList.add('u-hidden');
        timeButton.classList.remove('u-hidden');
        timeButton.classList.add('u-showing');
    })
}



//***__________ BUTTON GETIKT OP MAP VAN DE BOEF __________***//
function getiktButton() {
    var tikButton = document.querySelector('.js-tik_button');
    var tikShow = document.querySelector('.js-tik_button_back');

    tikButton.addEventListener('click', function () {
        console.log("tik");
        tikButton.classList.remove('u-showing');
        tikButton.classList.add('u-hidden');
        tikShow.classList.remove('u-hidden');
        tikShow.classList.add('u-showing');
        tikButtonBack();
    })
}
function tikButtonBack() {
    var tikButton = document.querySelector('.js-tik_button');
    var tikShow = document.querySelector('.js-tik_button_back');

    setTimeout(() => {
        tikShow.classList.remove('u-showing');
        tikShow.classList.add('u-hidden');
        tikButton.classList.remove('u-hidden');
        tikButton.classList.add('u-showing');
        }, 3000);
}



//***__________ TIMER STARTEN __________***//
function startTimer(durationSeconds, display) {
    var seconds = new Date().getTime() + durationSeconds * 1000;
    const secondsCount = Math.ceil((seconds - new Date().getTime()) / 1000);

    var timer = secondsCount, minutes, seconds;    

    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timeFull = minutes + ":" + seconds;
        
        display.textContent = timeFull;

        if (--timer < 0) {
            timer = durationSeconds;
        }
    }, 1000);
}



//***__________ BUTTONS SPELREGELS/LEADERBOARD/BOEF & Jager__________***//
function goToLeaderboard() {
    window.location.href = "/pages/leaderboard.html";
}
function goToSpelregels() {
    window.location.href = "/pages/spelregelsBoef.html";
}
function goToBoefPage() {
    window.location.href = "/pages/boef.html";
    localStorage.setItem('role', 'boef');
}
function goToJagerPage() {
    const code = localStorage.getItem('spelCode');

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {

            if (response.data[0].beginJager == false) {
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": response.data[0].id,
                        "timeLimit": response.data[0].timeLimit,
                        "groep": response.data[0].groep,
                        "BoefLatitude": response.data[0].BoefLatitude,
                        "BoefLongtitude": response.data[0].BoefLongtitude,
                        "spelcode": code,
                        "inProgress": response.data[0].inProgress,
                        "startTime": response.data[0].startTime,
                        "endTime": response.data[0].endTime,
                        "aantalSpelers": response.data[0].aantalSpelers,
                        "winner": response.data[0].winner,
                        "startSpelkeuze": true,
                        "startSpel": response.data[0].startSpel,
                        "beginJager": true,
                        "startTimeJs": response.data[0].startTimeJs,
                        "endTimeJs": response.data[0].endTimeJs,
                        "gespeeldeTijd": response.data[0].gespeeldeTijd
                    })
                };
                fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

                setTimeout(() => { window.location.href = "/pages/jager.html"; }, 200)

            } else {
                window.location.href = "../pages/moreJagers.html";
            }
        })
        .catch(error => {
            console.log(error)
        });

    localStorage.setItem('role', 'jager');
}
function goBackToRoles() {
    window.location.href = "../pages/spelKeuze.html";
    localStorage.removeItem('role');
}




//***__________ USERS SAMEN NAAR "BOEF" & "JAGER" KNOPPEN __________***//
function SynchronizedStart(code) {

    setInterval(() => {
        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {
                if (response.data[0].startSpelkeuze == 1) {
                    window.location.href = "/pages/spelKeuze.html";
                }
            })
            .catch(error => {
                console.log(error)
            });
    }, 1000);
}



//***__________ USERS SAMEN NAAR COUNTDOWN __________***//
function SynchronizedStartCountdown(code) {

    setInterval(() => {
        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {
                console.log(response.data);

                if (response.data[0].startSpel == 1) {
                    window.location.href = "/pages/countDown.html";
                }
            })
            .catch(error => {
                console.log(error)
            });
    }, 1000);
}



//***__________ SPEL STARTEN WANNEER GROEPSNAAM IS OPGEGEVEN __________***//
function spelStarten() {
    const code = localStorage.getItem('spelCode');

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "id": response.data[0].id,
                    "timeLimit": response.data[0].timeLimit,
                    "groep": response.data[0].groep,
                    "BoefLatitude": response.data[0].BoefLatitude,
                    "BoefLongtitude": response.data[0].BoefLongtitude,
                    "spelcode": code,
                    "inProgress": response.data[0].inProgress,
                    "startTime": response.data[0].startTime,
                    "endTime": response.data[0].endTime,
                    "aantalSpelers": response.data[0].aantalSpelers,
                    "winner": response.data[0].winner,
                    "startSpelkeuze": true,
                    "startSpel": response.data[0].startSpel,
                    "startTimeJs": response.data[0].startTimeJs,
                    "endTimeJs": response.data[0].endTimeJs,
                    "gespeeldeTijd": response.data[0].gespeeldeTijd
                })
            };
            fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

            setTimeout(() => { window.location.href = "/pages/spelKeuze.html"; }, 800)
                .then(response => response.json())
        })
        .catch(error => {
            console.log(error)
        });

}



//***__________ SPEL STARTEN WANNEER DURATION IS OPGEGEVEN __________***//
function spelStartenCountdown() {
    const code = localStorage.getItem('spelCode');
    
    const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "spelcode": code,
                "inProgress": true
            })
    };
        console.log('naar hardware')
        fetch('https://jachtseizoenapi.azurewebsites.net/api/mqtt/gameInfo', requestOptions)
            .then(response => response.json())


    const startTijd = new Date().getTime();
    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "id": response.data[0].id,
                    "timeLimit": response.data[0].timeLimit,
                    "groep": response.data[0].groep,
                    "BoefLatitude": response.data[0].BoefLatitude,
                    "BoefLongtitude": response.data[0].BoefLongtitude,
                    "spelcode": code,
                    "inProgress": true,
                    "startTime": response.data[0].startTime,
                    "endTime": response.data[0].endTime,
                    "aantalSpelers": response.data[0].aantalSpelers,
                    "winner": response.data[0].winner,
                    "startSpelkeuze": true,
                    "startSpel": true,
                    "startTimeJs": startTijd,
                    "endTimeJs": response.data[0].endTimeJs,
                    "durationGame": localStorage.getItem('durationGame'),
                    "durationLocation": localStorage.getItem('durationLocation'),
                    "gespeeldeTijd": response.data[0].gespeeldeTijd
                })
            };
            fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

            setTimeout(() => { window.location.href = "/pages/countDown.html"; }, 800)
            .then(response => response.json())
         })
        .catch(error => {
            console.log(error)
        });

}



//***__________ SAVES ALL DATA FOR THE GAME THAT IS SELECTED __________***//
function setDuration() {
    const radioGroup = document.querySelectorAll('input[name="spel"]');
    let selectedValue;

    for (let i = 0; i < radioGroup.length; i++) {
        if (radioGroup[i].checked) {
            selectedValue = radioGroup[i].value;
            break;
        }
    }

    const code = localStorage.getItem('spelCode');

    if (!selectedValue) {
        document.querySelector('.js-form-error').innerHTML = "Kies een spel";
    } else {
        document.querySelector('.js-form-error').innerHTML = "";

        if (selectedValue == "15") {
            localStorage.setItem('durationGame', 30);
            localStorage.setItem('waitTimeJager', 5);
            localStorage.setItem('durationLocation', 10);
        } else if (selectedValue == "60") {
            localStorage.setItem('durationGame', 3600);
            localStorage.setItem('waitTimeJager', 300);
            localStorage.setItem('durationLocation', 300);
        } else if (selectedValue == "120") {
            localStorage.setItem('durationGame', 7200);
            localStorage.setItem('waitTimeJager', 600);
            localStorage.setItem('durationLocation', 600);
        } else if (selectedValue == "240") {
            localStorage.setItem('durationGame', 14400);
            localStorage.setItem('waitTimeJager', 1200);
            localStorage.setItem('durationLocation', 600);
        }

        const startTijd = new Date().getTime();
        localStorage.setItem('startTime', startTijd);


        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": response.data[0].id,
                        "timeLimit": response.data[0].timeLimit,
                        "groep": response.data[0].groep,
                        "BoefLatitude": response.data[0].BoefLatitude,
                        "BoefLongtitude": response.data[0].BoefLongtitude,
                        "spelcode": code,
                        "inProgress": response.data[0].inProgress,
                        "startTime": response.data[0].startTime,
                        "endTime": response.data[0].endTime,
                        "startTimeJs": startTijd,
                        "endTimeJs": response.data[0].endTimeJs,
                        "aantalSpelers": response.data[0].aantalSpelers,
                        "winner": response.data[0].winner,
                        "startSpelkeuze": true,
                        "startSpel": true,
                        "durationGame": localStorage.getItem('durationGame'),
                        "durationLocation": localStorage.getItem('durationLocation'),
                        "startTimeJs": response.data[0].startTimeJs,
                        "endTimeJs": response.data[0].endTimeJs,
                        "gespeeldeTijd": response.data[0].gespeeldeTijd
                    })
                };
                fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

                spelStartenCountdown()

            })
            .catch(error => {
                console.log(error)
            });
    }
}



//***__________ AUTOMATISCH NAAR BOEF OF JAGER MAP GAAN __________***//
function mapForBoefOrJager() {
    if (localStorage.getItem('role') == "boef") {
        setTimeout(() => { window.location.href = "../pages/mapBoef.html"; }, 5100)
    } else if (localStorage.getItem('role') == "jager") {
        setTimeout(() => { window.location.href = "../pages/CountdownJager.html"; }, 5100)
    }
}



//***__________ SHOW TIMER OP MAP BOEF __________***//
function showTimesMapBoef() {

    const code = localStorage.getItem('spelCode');

    const gameDurationplace = document.getElementById("js-durationTime");
    const locationDurationPlace = document.getElementById("js-locationTime");

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
                .then(response => {

                    var gameDuration = response.data[0].durationGame;
                    var locationDuration = response.data[0].durationLocation;

                    startTimer(gameDuration, gameDurationplace);
                    startTimer(locationDuration, locationDurationPlace);


                })
                .catch(error => {
                    console.log(error)
                });
}



//***__________ SHOW TIMER OP MAP JAGER __________***//
function showTimesMapJager() {
    var gameDuration = localStorage.getItem('durationGame');
    var locationDuration = localStorage.getItem('durationLocation');
    var waitTimeJager = localStorage.getItem('waitTimeJager');

    const gameDurationplace = document.getElementById("js-durationTime");
    const locationDurationPlace = document.getElementById("js-locationTime");

    startTimer(gameDuration - waitTimeJager, gameDurationplace);
    startTimer(locationDuration, locationDurationPlace);
}




//***__________ OPENS MODAL WINDOW TO CLOSE THE GAME __________***//
function goCloseGame() {
    var modal = document.getElementById("closeModal");
    var btn = document.getElementById("CloseBtn");
    var btnCloseModal = document.getElementsByClassName("c-modal__close-btn")[0];
    var btnCloseModal2 = document.getElementById('goBackToMap');

    btn.onclick = function () {
        modal.style.display = "block";
    }

    btnCloseModal.onclick = function () {
        modal.style.display = "none";
    }
    btnCloseModal2.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}



//***__________ SPEL VERLATEN & LOCALSTORAGE VERWIJDEREN __________***//
function leaveGame() {
    window.location.href = "../index.html";
    localStorage.clear();
}



//***__________ STUURT CURRENT LOCATION VAN DE BOEF NAAR DB __________***//
function sendCoordinates() {
    const code = localStorage.getItem('spelCode');

    navigator.geolocation.getCurrentPosition(function (position) {

        const lat2 = position.coords.latitude;
        const long2 = position.coords.longitude;

        axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": response.data[0].id,
                        "groep": response.data[0].groep,
                        "spelcode": code,
                        "inProgress": response.data[0].inProgress,
                        "startTime": response.data[0].startTime,
                        "endTime": response.data[0].endTime,
                        "aantalSpelers": response.data[0].aantalSpelers,
                        "winner": response.data[0].winner,
                        "startSpelkeuze": response.data[0].startSpelkeuze,
                        "startSpel": response.data[0].startSpel,
                        "durationGame": response.data[0].durationGame,
                        "durationLocation": response.data[0].durationLocation,
                        "BoefLatitude": lat2,
                        "BoefLongtitude": long2,
                        "startTimeJs": response.data[0].startTimeJs,
                        "endTimeJs": response.data[0].endTimeJs,
                        "gespeeldeTijd": response.data[0].gespeeldeTijd
                    })
                };
                fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)
                console.log("coordinates sent")

            })
            .catch(error => {
                console.log(error)
            });
    })

    setInterval(() => {

        navigator.geolocation.getCurrentPosition(function (position) {

            const lat = position.coords.latitude;
            const long = position.coords.longitude;

            axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
                .then(response => {
                    const requestOptions = {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            "id": response.data[0].id,
                            "groep": response.data[0].groep,
                            "spelcode": code,
                            "inProgress": response.data[0].inProgress,
                            "startTime": response.data[0].startTime,
                            "endTime": response.data[0].endTime,
                            "aantalSpelers": response.data[0].aantalSpelers,
                            "winner": response.data[0].winner,
                            "startSpelkeuze": response.data[0].startSpelkeuze,
                            "startSpel": response.data[0].startSpel,
                            "durationGame": response.data[0].durationGame,
                            "durationLocation": response.data[0].durationLocation,
                            "BoefLatitude": lat,
                            "BoefLongtitude": long,
                            "startTimeJs": response.data[0].startTimeJs,
                            "endTimeJs": response.data[0].endTimeJs,
                            "gespeeldeTijd": response.data[0].gespeeldeTijd
                        })
                    };
                    fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)
                    console.log("coordinates sent")

                })
                .catch(error => {
                    console.log(error)
                });

        });

    }, 2000);
}



//***__________ HAALT COORDINATEN UIT DB EN TOONT MAP __________***//
function showMapWithCoordinates() {
    const code = localStorage.getItem('spelCode');

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
        .then(response => {
            showMap(response.data[0].BoefLatitude, response.data[0].BoefLongtitude);
        })
        .catch(error => {
            console.log(error)
        });
}



//***__________ CONTROLEERT OF TIJD OP IS EN HET SPEL GEDAAN IS __________***//
function checkTime() {
    const code = localStorage.getItem('spelCode');

    setInterval(function(){
        if(document.getElementById("js-durationTime").innerHTML == "00:00"){
            console.log("time over")
            if (localStorage.getItem('role') == "jager") {
                setTimeout(() => { window.location.href = "../pages/GameOverOverlay.html"; }, 200)
            } else {
                setTimeout(() => { window.location.href = "../pages/GewonnenOverlay.html"; }, 200)
            }

            const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "spelcode": code,
                "inProgress": false ,
                "jagersWinnen": false
            })
        };
        console.log('naar hardware')
        fetch('https://jachtseizoenapi.azurewebsites.net/api/mqtt/gameResults', requestOptions)
            .then(response => response.json())
        }
        
    }, 1000)
}




//***__________ CHECK ALS DE VALUE IN DB VERANDERD WANNEER HET HARNAS GETIKT WORDT MET RFID __________***//
function checkRFID() {
    const code = localStorage.getItem('spelCode');

    setInterval(() => {
            axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
                .then(response => {
                    if (response.data[0].inProgress == false){
                        console.log("spel gedaan");
                        getikt();
                    }
                })
                .catch(error => {
                    console.log(error)
                });

    }, 1000);
}



//***__________ TIJD STOPPEN WANNEER GETIKT & NAAR GAME OVER OF GEWONNEN PAGINA GAAN __________***//
function getikt() {

    const code = localStorage.getItem('spelCode');
    const stopTijd = new Date().getTime();
    const role = localStorage.getItem('role');

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {

                var tussenTijd = stopTijd - response.data[0].startTimeJs;
                const gespeeldeTijd = Math.ceil((tussenTijd) / 1000);

                var timer = gespeeldeTijd, minutes, seconds;    

                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                totaleGespeeldeTijd = minutes + ":" + seconds;

                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "id": response.data[0].id,
                        "timeLimit": response.data[0].timeLimit,
                        "groep": response.data[0].groep,
                        "BoefLatitude": response.data[0].BoefLatitude,
                        "BoefLongtitude": response.data[0].BoefLongtitude,
                        "spelcode": code,
                        "inProgress": response.data[0].inProgress,
                        "startTime": response.data[0].startTime,
                        "endTime": response.data[0].endTime,
                        "aantalSpelers": response.data[0].aantalSpelers,
                        "winner": response.data[0].winner,
                        "startSpelkeuze": response.data[0].startSpelkeuze,
                        "startSpel": response.data[0].startSpel,
                        "durationGame": response.data[0].durationGame,
                        "durationLocation": response.data[0].durationLocation,
                        "startTimeJs": response.data[0].startTimeJs,
                        "endTimeJs": response.data[0].endTimeJs,
                        "endGame": true,
                        "gespeeldeTijd": totaleGespeeldeTijd
                    })
                };
                fetch('https://jachtseizoenapi.azurewebsites.net/api/games', requestOptions)

                if (role == 'boef'){
                    setTimeout(() => { window.location.href = "../pages/GameOverOverlay.html"; }, 600)
                }
                else {
                    setTimeout(() => { window.location.href = "../pages/GewonnenOverOverlay.html"; }, 600)
                }

            })
            .catch(error => {
                console.log(error)
            });
}



//***__________ CHECKEN OF SPEL AFGELOPEN IS VOOR DE JAGERS WANNEER BOEVEN GETIKT ZIJN __________***//
function checkifGameDone () {
    const code = localStorage.getItem('spelCode');
    
    setInterval(() => {
    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {

                if (response.data[0].endGame == true){
                    setTimeout(() => { window.location.href = "../pages/GewonnenOverlay.html"; }, 200)
                    console.log("boef verloren, want getikt")
                }
            })
            .catch(error => {
                console.log(error)
            });
    }, 1000)
}



//***__________ TOONT DE GESPEELDE TIJD OP HET EINDE VAN HET SPEL __________***//
function afterGamestat (){
    const code = localStorage.getItem('spelCode');

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/code/${code}?`)
            .then(response => {
                console.log(response.data[0].gespeeldeTijd)
                document.querySelector(".js-gespeeldeTijd").innerHTML = response.data[0].gespeeldeTijd;
            })
            .catch(error => {
                console.log(error)
            });
}



//***__________ LEADERBOARD -> PAKT HET GESELECTEERDE VALUE VAN DROPDOWN & TOONT DE DATA IN LEADERBOARD __________***//
function getSelectedType() {
    const item = document.formNiveau.spelNiveaus.selectedIndex;
    const type = document.formNiveau.spelNiveaus.options[item].value;
    console.log(type);

    axios.get(`https://jachtseizoenapi.azurewebsites.net/api/games/duration/${type}?`)
        .then(response => {

                //alles leeg zetten
                document.querySelector(".js-second_place-name").innerHTML = "";
                document.querySelector(".js-second_place-time").innerHTML = "";
                document.querySelector(".js-first_place-name").innerHTML = "";
                document.querySelector(".js-first_place-time").innerHTML = "";
                document.querySelector(".js-third_place-name").innerHTML = "";
                document.querySelector(".js-third_place-time").innerHTML = "";
                document.querySelector(".js-leaderboard-list").innerHTML = "";


                //1ste team
                document.querySelector(".js-second_place-name").innerHTML = response.data[1].groep;
                if (response.data[1].gespeeldeTijd == null) {
                    document.querySelector(".js-second_place-time").innerHTML = "00:00";
                } else {
                    document.querySelector(".js-second_place-time").innerHTML = response.data[1].gespeeldeTijd
                }

                //2de team
                document.querySelector(".js-first_place-name").innerHTML = response.data[0].groep;
                if (response.data[0].gespeeldeTijd == null) {
                    document.querySelector(".js-first_place-time").innerHTML = "00:00";
                } else {
                    document.querySelector(".js-first_place-time").innerHTML = response.data[0].gespeeldeTijd
                }
                
                //3de team
                document.querySelector(".js-third_place-name").innerHTML = response.data[2].groep;
                if (response.data[2].gespeeldeTijd == null) {
                    document.querySelector(".js-third_place-time").innerHTML = "00:00";
                } else {
                    document.querySelector(".js-third_place-time").innerHTML = response.data[2].gespeeldeTijd
                }
            

                //al de andere in de list
                let htmlstring = "";
                let number = 4;
            for (let data of response.data.slice(3)) {
                    htmlstring += `<li class="c-leaderboard-list__item"><span class="c-leaderboard-place">${number}.</span><span class="c-leaderboard-groepsnaam">${data.groep}</span> <span class="c-leaderboard-played-time">${data.gespeeldeTijd}</span></li>
                                    <li class="c-leaderboard-list__line"><hr class="c-leaderboard-line"></li>`;
                    document.querySelector(".js-leaderboard-list").innerHTML = htmlstring;
                    number += 1
            }
                
            })
            .catch(error => {
                console.log(error)
            });
}





//***__________ DOM CONTENT __________***//
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');

    //kijken welke pagina geladen is
    const index = document.getElementById('index');
    const startenSpelDataPage = document.getElementById('startenSpelData');
    const startCountdown = document.getElementById('startCountdown');
    const map = document.getElementById('mapPage');
    const mapJager = document.getElementById('mapPageJager');
    const wachtenHost = document.getElementById('wachtHostPage');
    const countDown = document.getElementById('countDownPage');
    const boef = document.getElementById('boef');
    const jagerWachten = document.getElementById('jagerWachtHostPage');
    const mapBoef = document.getElementById('js-mapBoef');
    const leaderboard = document.getElementById('leaderboard');
    const gewonnen = document.getElementById('gewonnenOverlay');
    const verloren = document.getElementById('verlorenOverlay');
    const deelnemen = document.getElementById('deelnemenPage');
    const moreJagers = document.getElementById('moreJagersPage');

    //functies voor elke pagina laden
    if (index) {
    }
    if (startenSpelDataPage) {
        showSpelData();
    }
    if (startCountdown) {
        var durationSeconds = localStorage.getItem('waitTimeJager'), display = document.querySelector('.js-start_countdown');
        display2 = document.querySelector('.js-start_countdown2')
        startTimer(durationSeconds, display);
        startTimer(durationSeconds, display2);
        setTimeout(() => { window.location.href = "../pages/mapJager.html"; }, durationSeconds * 1000)
        goCloseGame();
    }
    if (map) {
        // createNewGame();
        timeButton();
        timeButtonBack();
        showTimesMap();
        showMapWithCoordinates();
    }
    if (mapJager) {
        timeButton();
        timeButtonBack();
        showTimesMapJager();
        showMapWithCoordinates();
        checkTime();
        checkifGameDone();
        goCloseGame();
        checkRFID();
    }
    if (mapBoef) {
        timeButton();
        timeButtonBack();
        showTimesMapBoef();
        sendCoordinates();
        showMapBoef();
        checkTime();
        goCloseGame();
        checkRFID();
        getiktButton();
        //tikButtonBack();
    }
    if (wachtenHost) {
        const code = localStorage.getItem('spelCode');
        document.querySelector('.js-spelCode').innerHTML = code;
        SynchronizedStart(code);
        lottieWaiting();
    }
    if (countDown) {
        lottieCountDown();
        mapForBoefOrJager();
    }
    if (boef) {
        const code = localStorage.getItem('spelCode');
        SynchronizedStartCountdown(code);
    }
    if (jagerWachten) {
        lottieWaiting();
        const code = localStorage.getItem('spelCode');
        SynchronizedStartCountdown(code);
    }
    if(leaderboard) {
        modalWindow();
        getSelectedType();
    }
    if (gewonnen) {
        afterGamestat();
        goCloseGame();
    }
    if (verloren) {
        afterGamestat();
        goCloseGame();
    }
    if (deelnemen) {
        addDash();
    }
    if (moreJagers) {
        const code = localStorage.getItem('spelCode');
        SynchronizedStartCountdown(code);
    }
})