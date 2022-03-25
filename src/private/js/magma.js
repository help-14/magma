// Get CSS
var declaration = document.styleSheets[1].cssRules[0];
var allVar = declaration.style.cssText.split(";");
var cssRootKeys = {}
for (var i = 0; i < allVar.length; i++) {
    var a = allVar[i].split(':');
    if (a[0] !== "")
        cssRootKeys[a[0].trim()] = a[1].trim();
}

// Set Clock
var clock = document.getElementById("clock");
const clockOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
(function clockTick() {
    clock.innerText = new Date().toLocaleTimeString("vi-vn", clockOptions);
    setTimeout(clockTick, 2000);
})();

// Set weather icon
var skycons = new Skycons({ "color": cssRootKeys["--accentColor"] });
skycons.add("weather-icon", Skycons.PARTLY_CLOUDY_DAY);