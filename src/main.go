package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"

	modules "github.com/help-14/magma/modules"
)

func main() {
	tempPath := filepath.Join(".", "temp")
	err := os.MkdirAll(tempPath, os.ModePerm)
	if err != nil {
		log.Fatal(err)
		return
	}

	fs := http.FileServer(http.Dir("./temp"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	modules.LoadConfig()

	log.Println("Listening on :7001 ...")
	err = http.ListenAndServe(":7001", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	lp := filepath.Join("templates", "layout.html")
	fp := filepath.Join("templates", filepath.Clean(r.URL.Path))

	tmpl, _ := template.ParseFiles(lp, fp)
	tmpl.ExecuteTemplate(w, "layout", nil)
}

// templ.Execute(file, struct {
//     Age int
//     Name string
// }{42, "Dolphin"})

// {{.Age}}, {{.Name}}
