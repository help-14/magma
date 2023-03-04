package modules

import (
	"io"
	"log"
	"net/http"
	"time"
)

func SetupWeather(mux *http.ServeMux) {
	mux.HandleFunc("/weather", serveWeather)
}

func serveWeather(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	data := GetWeather(AppConfig.OpenWeatherMap.ApiKey, AppConfig.OpenWeatherMap.Latitude, AppConfig.OpenWeatherMap.Longitude)
	if data != nil {
		w.Write(data)
	}
}

var weatherTimeOut int64
var weatherCache []byte
var demoData = []byte("{\"coord\":{\"lon\":105.8085,\"lat\":21.0427},\"weather\":[{\"id\":803,\"main\":\"Clouds\",\"description\":\"broken clouds\",\"icon\":\"04n\"}],\"base\":\"stations\",\"main\":{\"temp\":301.14,\"feels_like\":305.69,\"temp_min\":301.14,\"temp_max\":301.14,\"pressure\":1004,\"humidity\":83},\"visibility\":10000,\"wind\":{\"speed\":6.17,\"deg\":120},\"clouds\":{\"all\":75},\"dt\":1650981392,\"sys\":{\"type\":1,\"id\":9308,\"country\":\"VN\",\"sunrise\":1650925786,\"sunset\":1650971952},\"timezone\":25200,\"id\":1581130,\"name\":\"Hanoi\",\"cod\":200}")

func GetWeather(apiKey string, latitude string, longitude string) []byte {
	if apiKey == "demo" {
		return demoData
	} else {
		if time.Now().UnixMilli() >= weatherTimeOut {
			resp, err := http.Get("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&limit=1&appid=" + apiKey)
			if err != nil {
				log.Fatalln(err)
				return nil
			}
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				log.Fatalln(err)
				return nil
			}
			weatherCache = body
			weatherTimeOut = time.Now().UnixMilli() + 1800000
		}
		return weatherCache
	}
}
