package modules

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/fsnotify/fsnotify"
)

func SetupTemplate(mux *http.ServeMux) {
	loadData()
	go watchChanges()

	commonfs := http.FileServer(http.Dir(filepath.Join(CurrentPath(), "data")))
	mux.Handle("/common/", http.StripPrefix("/common/", commonfs))

	th := themeHandler{}
	mux.Handle("/theme/", th)

	mux.HandleFunc("/", serveTemplate)
}

var websiteData = struct {
	Config   WebsiteConfig
	Language Language
	Contents []GroupData
	IsLocal  bool
}{}
var privateContent []GroupData
var publicContent []GroupData
var webTemplate *template.Template

func loadData() {
	LoadConfig()
	websiteData.Config = AppConfig.Website
	websiteData.Language = LoadLanguage(AppConfig.Website.Language)
	websiteData.Contents = LoadContent().Data
	loadTemplate()

	// Download icon to local and remove local ressources access
	for groupIndex := 0; groupIndex < len(websiteData.Contents); groupIndex++ {
		group := websiteData.Contents[groupIndex]
		groupDataPublic := []ColumnData{}
		groupDataPrivate := []ColumnData{}

		for colIndex := 0; colIndex < len(group.Columns); colIndex++ {
			column := group.Columns[colIndex]
			columnDataPublic := []BookmarkData{}
			columnDataPrivate := []BookmarkData{}

			for bookmarkIndex := 0; bookmarkIndex < len(column.Bookmarks); bookmarkIndex++ {
				bookmarkData := column.Bookmarks[bookmarkIndex]
				iconPath := bookmarkData.Icon

				//download icon
				if bookmarkData.IsImage() || bookmarkData.IsSVG() {
					fileName := path.Base(iconPath)
					if DownloadFile(iconPath, filepath.Join(CurrentPath(), "data", "icon", fileName)) {
						iconPath = "/common/icon/" + fileName
					}
				}

				//add to private array
				url := bookmarkData.Url
				if len(bookmarkData.UrlLocal) > 0 {
					url = bookmarkData.UrlLocal
				}
				columnDataPrivate = append(columnDataPrivate, BookmarkData{bookmarkData.Name, url, bookmarkData.UrlLocal, iconPath, true})

				//add to public array
				if !bookmarkData.IsLocal && len(bookmarkData.Url) > 0 {
					columnDataPublic = append(columnDataPublic, BookmarkData{bookmarkData.Name, bookmarkData.Url, bookmarkData.UrlLocal, iconPath, false})
				}
			}

			if len(columnDataPublic) > 0 {
				groupDataPublic = append(groupDataPublic, ColumnData{column.Title, columnDataPublic, column.Icon})
			}
			if len(columnDataPrivate) > 0 {
				groupDataPrivate = append(groupDataPrivate, ColumnData{column.Title, columnDataPrivate, column.Icon})
			}
		}

		if len(groupDataPublic) > 0 {
			publicContent = append(publicContent, GroupData{group.Title, groupDataPublic, group.Icon})
		}
		if len(groupDataPrivate) > 0 {
			privateContent = append(privateContent, GroupData{group.Title, groupDataPrivate, group.Icon})
		}
	}
}

var themeDir string

type themeHandler struct {
	format string
}

func (th themeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	newPath := strings.Replace(r.URL.Path, "/theme", themeDir, 1)
	fmt.Println(newPath)
	http.ServeFile(w, r, newPath)
}

func loadTemplate() {
	themeDir = filepath.Join(CurrentPath(), "themes", AppConfig.Website.Theme)
	tmpl, _ := template.ParseFiles(filepath.Join(themeDir, "index.html"))
	webTemplate = tmpl
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	websiteData.IsLocal = ClientIsLocal(r)
	if websiteData.IsLocal {
		websiteData.Contents = privateContent
	} else {
		websiteData.Contents = publicContent
	}
	webTemplate.Execute(w, websiteData)
}

func watchChanges() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
		return
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

	watcher.Add(filepath.Join(CurrentPath(), "data", "data.yaml"))
	watcher.Add(filepath.Join(CurrentPath(), "data", "config.yaml"))
	watcher.Add(filepath.Join(CurrentPath(), "themes", AppConfig.Website.Theme, "index.html"))
	<-done
}
