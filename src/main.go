package main

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"

	"github.com/help-14/magma/modules"
)

func main() {
	appConfig := modules.LoadConfig()

	commonfs := http.FileServer(http.Dir("./common"))
	http.Handle("/common/", http.StripPrefix("/common/", commonfs))

	themePath := "/themes/" + appConfig.Website.Theme + "/"
	themefs := http.FileServer(http.Dir("." + themePath))
	http.Handle("/theme/", http.StripPrefix("/theme/", themefs))

	http.HandleFunc("/", serveTemplate)
	// tempPath := filepath.Join(".", "temp")
	// err := os.MkdirAll(tempPath, os.ModePerm)
	// if err != nil {
	// 	log.Fatal(err)
	// 	return
	// }

	log.Println("Listening on :7001 ...")
	err := http.ListenAndServe(":7001", nil)
	if err != nil {
		log.Fatal(err)
	}
}

// func TemplatedHandler(response http.ResponseWriter, request *http.Request) {
// 	tmplt := template.New("hello template")
// 	tmplt, _ = tmplt.Parse("Top Student: {{.Id}} - {{.Name}}!")

// 	p := Student{Id: 1, Name: "Aisha"} //define an instance with required field

// 	tmplt.Execute(response, p) //merge template ‘t’ with content of ‘p’
// }

func serveTemplate(w http.ResponseWriter, r *http.Request) {
	lp := filepath.Join("templates", "layout.html")
	//fp := filepath.Join("templates", filepath.Clean(r.URL.Path))

	tmpl, _ := template.ParseFiles(lp)
	tmpl.Execute(w, nil)
}

// templ.Execute(file, struct {
//     Age int
//     Name string
// }{42, "Dolphin"})

// {{.Age}}, {{.Name}}
