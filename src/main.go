package main

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"

	"github.com/help-14/magma/modules"
)

var appConfig modules.Config

func main() {
	appConfig = modules.LoadConfig()

	commonfs := http.FileServer(http.Dir("./common"))
	http.Handle("/common/", http.StripPrefix("/common/", commonfs))

	languagefs := http.FileServer(http.Dir("./languages"))
	http.Handle("/languages/", http.StripPrefix("/languages/", languagefs))

	themePath := "/themes/" + appConfig.Website.Theme + "/"
	themefs := http.FileServer(http.Dir("." + themePath))
	http.Handle("/theme/", http.StripPrefix("/theme/", themefs))

	http.HandleFunc("/", serveTemplate)

	log.Println("Listening on http://localhost:7001 ...")
	err := http.ListenAndServe(":7001", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	lp := filepath.Join("themes", appConfig.Website.Theme, "index.html")
	tmpl, _ := template.ParseFiles(lp)
	tmpl.Execute(w, struct {
		Config modules.WebsiteConfig
	}{appConfig.Website})
}

// templ.Execute(file, struct {
//     Age int
//     Name string
// }{42, "Dolphin"})

// {{.Age}}, {{.Name}}
