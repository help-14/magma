async function loadConfig() {
    window.config = await (await fetch("./config.json")).json();
    // Set website language
    document.documentElement.setAttribute("lang", window.config.website.language);
    // Set website title
    document.title = window.config.website.title;
    // Set website description
    document.querySelector('meta[name="description"]').setAttribute("content", window.config.website.description);
}

async function loadLanguage() {
    try {
        window.language = await (await fetch(`./${window.config.website.language}.json`)).json();
    } catch {
        window.language = await (await fetch(`./en.json`)).json();
    }
}

async function loadWeather() {
    // Get info from api
    const weather = await (await fetch("./weather")).json();
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

async function loadBookmarks() {
    const data = await (await fetch("./data.json")).json();
    let contentHtml = "";

    function splitToChunks(arr) {
        var chunks = [[], [], [], []];
        var i = 0;
        for (let j = 0; j < arr.length; j++) {
            chunks[i].push(arr[j]);
            i++;
            if (i === 4) i = 0;
        }
        return chunks;
    }

    function splitToEqualChunks(arr) {
        var chunks = [];
        var i = 0;
        while (i < arr.length) {
            chunks.push(arr.slice(i, Math.min(i + 4, arr.length)));
            i += 4;
        }
        return chunks;
    }

    data.forEach(section => {
        contentHtml += `<div class="row group-title"><h4 class="strong">${section.title}</h4></div>`
        if (section.columns) {
            const chunks = splitToEqualChunks(section.columns)
            chunks.forEach(chunk => {
                contentHtml += '<div class="row">';
                chunk.forEach(column => {
                    contentHtml += `
                    <div class="three columns group-items">
                    <h6 class="accent">${column.title}</h6>`;
                    column.bookmarks.forEach(bookmark => {
                        contentHtml += `
                    <a href="${bookmark.url}">
                        <i class="${bookmark.icon} fa-xl icon"></i>
                        <h6>${bookmark.title}</h6>
                    </a>`;
                    });
                    contentHtml += "</div>";
                });
                contentHtml += "</div>";
            });

        } else if (section.bookmarks) {
            contentHtml += '<div class="row">';
            const chunks = splitToChunks(section.bookmarks)
            chunks.forEach(chunk => {
                contentHtml += '<div class="three columns group-items">';
                chunk.forEach(bookmark => {
                    contentHtml += `
                        <a href="${bookmark.url}">
                            <i class="${bookmark.icon} fa-xl icon"></i>
                            <h6>${bookmark.title}</h6>
                        </a>`;
                });
                contentHtml += "</div>";
            });
            contentHtml += "</div>";
        }
    });

    document.querySelector("#content").innerHTML = contentHtml;
}

function loadCSS() {
    for (let c = 0; c < document.styleSheets.length; c++) {
        var declaration = document.styleSheets[c].cssRules[0];
        if (declaration.selectorText === ":root") {
            var allVar = declaration.style.cssText.split(";");
            var cssRootKeys = {}
            for (var i = 0; i < allVar.length; i++) {
                var a = allVar[i].split(':');
                if (a[0] !== "")
                    cssRootKeys[a[0].trim()] = a[1].trim();
            }
            window.cssRoot = cssRootKeys;
            return;
        }
    }
}

function setClock() {
    //Set clock
    const clock = document.querySelector("#clock");
    const clockOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    (function clockTick() {
        clock.innerText = new Date().toLocaleTimeString(window.config.website.localization, clockOptions);
        setTimeout(clockTick, 2000);
    })();
    //Set greeting
    const greeting = document.querySelector("#greeting");
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        greeting.innerText = window.language.greeting.morning;
    }
    else if (hour >= 12 && hour < 17) {
        greeting.innerText = window.language.greeting.afternoon;
    }
    else if (hour >= 17 && hour < 20) {
        greeting.innerText = window.language.greeting.evening;
    }
    else {
        greeting.innerText = window.language.greeting.night;
    }
}

async function startWebsite() {
    // Load bookmarks
    loadBookmarks();
    // Load config
    await loadConfig();
    // Load language
    await loadLanguage();
    // Set Clock
    setClock();
    // Get CSS varriables
    loadCSS();
    // Set weather
    loadWeather();
}
startWebsite();