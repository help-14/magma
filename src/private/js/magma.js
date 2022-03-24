
var clock = document.getElementById("clock");
const clockOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
(function clockTick() {
    clock.innerText = new Date().toLocaleTimeString("vi-vn", clockOptions);
    setTimeout(clockTick, 2000);
})();

var skycons = new Skycons({ "color": "pink" });
skycons.add("weather-icon", Skycons.PARTLY_CLOUDY_DAY);