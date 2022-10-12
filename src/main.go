package main

import (
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"net"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/fsnotify/fsnotify"
	docker "github.com/help-14/magma/addons/docker"
	healthcheckserver "github.com/help-14/magma/addons/health-check-server"
	"github.com/help-14/magma/modules"
)

var pwd string
var themeDir string
var clientAddress string
var appConfig modules.Config
var websiteData = struct {
	Config   modules.WebsiteConfig
	Language modules.Language
	Contents []modules.GroupData
}{}
var webTemplate *template.Template

func main() {
	prepare()
	loadData()
	go watchChanges()

	commonfs := http.FileServer(http.Dir(filepath.Join(pwd, "data")))
	http.Handle("/common/", http.StripPrefix("/common/", commonfs))

	languagefs := http.FileServer(http.Dir(filepath.Join(pwd, "languages")))
	http.Handle("/languages/", http.StripPrefix("/languages/", languagefs))

	th := themeHandler{}
	http.Handle("/theme/", th)

	http.HandleFunc("/weather", serveWeather)
	http.HandleFunc("/", serveTemplate)

	//loadAddons()

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

	iconPath := filepath.Join(dataPath, "icon")
	os.RemoveAll(iconPath)
	os.MkdirAll(iconPath, os.ModePerm)

	modules.CopyDir(filepath.Join(pwd, "common"), dataPath, false)
}

func RemoveIndex(s []modules.BookmarkData, index int) {
	copy(s[index:], s[index+1:])
	s[len(s)-1] = modules.BookmarkData{"", "", "", false}
	s = s[:len(s)-1]
}

func pruneData() {
	// Remove local ressources access
	for group := 0; group < len(websiteData.Contents); group++ {
		for col := 0; col < len(websiteData.Contents[group].Columns); col++ {
			bookmarks := websiteData.Contents[group].Columns[col].Bookmarks
			for bookmark := 0; bookmark < len(websiteData.Contents[group].Columns[col].Bookmarks); bookmark++ {
				bookmarkData := websiteData.Contents[group].Columns[col].Bookmarks[bookmark]
				if bookmarkData.IsLocal {
					RemoveIndex(bookmarks, bookmark)
					bookmark--
				}
			}
			websiteData.Contents[group].Columns[col].Bookmarks = bookmarks
		}
	}
	loadTemplate()
}

func loadData() {
	appConfig = modules.LoadConfig()
	websiteData.Config = appConfig.Website
	websiteData.Language = modules.LoadLanguage(appConfig.Website.Language)
	websiteData.Contents = modules.LoadContent().Data

	// Download icon to local and remove local ressources access
	for group := 0; group < len(websiteData.Contents); group++ {
		for col := 0; col < len(websiteData.Contents[group].Columns); col++ {
			for bookmark := 0; bookmark < len(websiteData.Contents[group].Columns[col].Bookmarks); bookmark++ {
				bookmarkData := websiteData.Contents[group].Columns[col].Bookmarks[bookmark]
				if bookmarkData.IsImage() || bookmarkData.IsSVG() {
					iconPath := bookmarkData.Icon
					fileName := path.Base(iconPath)
					if modules.DownloadFile(iconPath, filepath.Join(pwd, "data", "icon", fileName)) {
						websiteData.Contents[group].Columns[col].Bookmarks[bookmark].Icon = "/common/icon/" + fileName
					}
				}
			}
		}
	}
	loadTemplate()
}

func loadTemplate() {
	themeDir = filepath.Join(pwd, "themes", appConfig.Website.Theme)
	tmpl, _ := template.ParseFiles(filepath.Join(themeDir, "index.html"))
	webTemplate = tmpl
}

func loadAddons() {
	for i := 0; i < len(appConfig.Addons); i++ {
		switch addonName := appConfig.Addons[i]; addonName {
		case "docker":
			docker.Setup()
		case "health-check-server":
			healthcheckserver.Setup()
		}
	}
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

func ClientIsLocal(r *http.Request) bool {
    IPAddress := net.ParseIP(r.Header.Get("X-Real-Ip"))
    if IPAddress == nil {
        IPAddress = net.ParseIP(r.Header.Get("X-Forwarded-For"))
    }
    if IPAddress == nil {
	    IPAddress = net.ParseIP(strings.Split(r.RemoteAddr, ":")[0])
    }
    return IPAddress.IsPrivate()
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	if ! ClientIsLocal(r) {
		pruneData()
	} else {
		loadData()
	}
	webTemplate.Execute(w, websiteData)
}

type themeHandler struct {
	format string
}

func (th themeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, strings.Replace(r.URL.Path, "/theme", themeDir, 1))
}

var weatherTimeOut int64
var weatherCache []byte

func serveWeather(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if appConfig.OpenWeatherMap.ApiKey == "demo" {
		w.Write([]byte("{\"coord\":{\"lon\":105.8085,\"lat\":21.0427},\"weather\":[{\"id\":803,\"main\":\"Clouds\",\"description\":\"broken clouds\",\"icon\":\"04n\"}],\"base\":\"stations\",\"main\":{\"temp\":301.14,\"feels_like\":305.69,\"temp_min\":301.14,\"temp_max\":301.14,\"pressure\":1004,\"humidity\":83},\"visibility\":10000,\"wind\":{\"speed\":6.17,\"deg\":120},\"clouds\":{\"all\":75},\"dt\":1650981392,\"sys\":{\"type\":1,\"id\":9308,\"country\":\"VN\",\"sunrise\":1650925786,\"sunset\":1650971952},\"timezone\":25200,\"id\":1581130,\"name\":\"Hanoi\",\"cod\":200}"))
	} else {
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
		w.Write(weatherCache)
	}
}
