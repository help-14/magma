package main

import (
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/help-14/magma/modules"
)

var pwd string
var appConfig modules.Config
var websiteData = struct {
	Config   modules.WebsiteConfig
	Language modules.Language
	Contents []modules.GroupData
}{}
var webTemplate *template.Template
var themefs http.Handler

func main() {
	prepare()
	loadData()
	go watchChanges()

	commonfs := http.FileServer(http.Dir(filepath.Join(pwd, "data")))
	http.Handle("/common/", http.StripPrefix("/common/", commonfs))

	languagefs := http.FileServer(http.Dir(filepath.Join(pwd, "languages")))
	http.Handle("/languages/", http.StripPrefix("/languages/", languagefs))

	http.Handle("/theme/", http.StripPrefix("/theme/", themefs))

	http.HandleFunc("/weather", serveWeather)
	http.HandleFunc("/", serveTemplate)

	log.Println("Listening on http://localhost:7001 ...")
	err := http.ListenAndServe(":7001", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func prepare() {
	pwd, _ = os.Getwd()

	dataPath := filepath.Join(pwd, "data")
	os.MkdirAll(dataPath, os.ModePerm)
	modules.CopyDir(filepath.Join(pwd, "common"), dataPath, false)
}

func loadData() {
	appConfig = modules.LoadConfig()
	websiteData.Config = appConfig.Website
	websiteData.Language = modules.LoadLanguage(appConfig.Website.Language)
	websiteData.Contents = modules.LoadContent().Data

	themefs = http.FileServer(http.Dir(filepath.Join(pwd, "themes", appConfig.Website.Theme)))
	tmpl, _ := template.ParseFiles(filepath.Join(pwd, "themes", appConfig.Website.Theme, "index.html"))
	webTemplate = tmpl
}

func watchChanges() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer watcher.Close()

	done := make(chan bool)
	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				log.Println("Modified file:", event.Name)
				loadData()
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("error:", err)
			}
		}
	}()

	watcher.Add(filepath.Join(pwd, "data", "data.yaml"))
	watcher.Add(filepath.Join(pwd, "data", "config.yaml"))
	watcher.Add(filepath.Join(pwd, "themes", appConfig.Website.Theme, "index.html"))
	<-done
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	webTemplate.Execute(w, websiteData)
}

var weatherTimeOut int64
var weatherCache []byte

func serveWeather(w http.ResponseWriter, r *http.Request) {
	if time.Now().UnixMilli() >= weatherTimeOut {
		resp, err := http.Get("https://api.openweathermap.org/data/2.5/weather?lat=" + appConfig.OpenWeatherMap.Latitude + "&lon=" + appConfig.OpenWeatherMap.Longitude + "&limit=1&appid=" + appConfig.OpenWeatherMap.ApiKey)
		if err != nil {
			log.Fatalln(err)
			return
		}
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalln(err)
			return
		}
		weatherCache = body
		weatherTimeOut = time.Now().UnixMilli() + 1800000
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(weatherCache)
}
