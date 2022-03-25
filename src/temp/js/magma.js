async function loadConfig() {
    window.config = await (await fetch("./config.json")).json();
    // Set website language
    document.documentElement.setAttribute("lang", window.config.website.language);
    // Set website title
    document.title = window.config.website.title;
    // Set website description
    document.querySelector('meta[name="description"]').setAttribute("content", window.config.website.description);
}

async function loadWeather() {
    // Get info from api
    const weather = { "coord": { "lon": 105.8129, "lat": 21.0426 }, "weather": [{ "id": 701, "main": "Mist", "description": "mist", "icon": "50n" }], "base": "stations", "main": { "temp": 297.14, "feels_like": 297.89, "temp_min": 297.14, "temp_max": 297.14, "pressure": 1008, "humidity": 88 }, "visibility": 4300, "wind": { "speed": 1.54, "deg": 30 }, "clouds": { "all": 100 }, "dt": 1648219888, "sys": { "type": 1, "id": 9308, "country": "VN", "sunrise": 1648162598, "sunset": 1648206535 }, "timezone": 25200, "id": 1581130, "name": "Hanoi", "cod": 200 };

    // Parse weather id
    let icon = null;
    let isDay = Date.now().hour >= 6 && Date.now().hour < 18;
    const weatherCode = weather.weather[0].id;
    if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(weatherCode)) {
        icon = Skycons.RAIN; //Thunderstorm
    } else if ([300, 301, 302, 310, 311, 312, 313, 314, 321].includes(weatherCode)) {
        icon = Skycons.RAIN; //Drizzle
    } else if ([500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(weatherCode)) {
        icon = Skycons.RAIN;
    } else if ([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(weatherCode)) {
        icon = Skycons.SNOW;
    } else if (weatherCode === 800) {
        icon = isDay ? Skycons.CLEAR_DAY : Skycons.CLEAR_NIGHT;
    } else if ([801, 802, 803, 804].includes(weatherCode)) {
        if (weatherCode >= 803) {
            icon = Skycons.CLOUDY;
        } else {
            icon = isDay ? Skycons.PARTLY_CLOUDY_DAY : Skycons.PARTLY_CLOUDY_NIGHT;
        }
    } else if ([762, 761, 751, 731, 721].includes(weatherCode)) {
        icon = Skycons.SLEET;
    } else if ([771, 781].includes(weatherCode)) {
        icon = Skycons.WIND;
    } else if ([701, 711, 741].includes(weatherCode)) {
        icon = Skycons.FOG;
    } else {
        return;
    }

    // Set weather icon to canvas
    var skycons = new Skycons({ "color": window.cssRoot["--accentColor"] });
    skycons.add("weather-icon", icon);

    // Set weather info
    if (window.config.website.useMetric) {
        document.querySelector("#temp").innerText = Math.floor(weather.main.temp - 273.15) + "°C";
    } else {
        document.querySelector("#temp").innerText = Math.floor((weather.main.temp - 32) * 5 / 9) + "°F";
    }
    document.querySelector("#humidity").innerText = Math.floor(weather.main.humidity) + "%";
    document.querySelector("#weather-info").style.visibility = "visible";
}

async function startWebsite() {
    // Load config
    await loadConfig();

    // Get CSS varriables
    var declaration = document.styleSheets[1].cssRules[0];
    var allVar = declaration.style.cssText.split(";");
    var cssRootKeys = {}
    for (var i = 0; i < allVar.length; i++) {
        var a = allVar[i].split(':');
        if (a[0] !== "")
            cssRootKeys[a[0].trim()] = a[1].trim();
    }
    window.cssRoot = cssRootKeys;

    // Set Clock
    var clock = document.getElementById("clock");
    const clockOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    (function clockTick() {
        clock.innerText = new Date().toLocaleTimeString(window.config.website.localization, clockOptions);
        setTimeout(clockTick, 2000);
    })();

    // Set weather
    loadWeather();
}

window.onload = startWebsite;