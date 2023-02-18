package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	docker "github.com/help-14/magma/addons/docker"
	healthcheckserver "github.com/help-14/magma/addons/health-check-server"
	"github.com/help-14/magma/modules"
)

func main() {
	prepare()

	modules.SetupLanguage()
	modules.SetupTemplate()
	modules.SetupWeather()
	//loadAddons()

	log.Println("Listening on http://localhost:7001 ...")
	err := http.ListenAndServe(":7001", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func prepare() {
	dataPath := filepath.Join(modules.CurrentPath(), "data")
	os.MkdirAll(dataPath, os.ModePerm)

	iconPath := filepath.Join(dataPath, "icon")
	os.RemoveAll(iconPath)
	os.MkdirAll(iconPath, os.ModePerm)

	modules.CopyDir(filepath.Join(modules.CurrentPath(), "common"), dataPath, false)
}

func loadAddons() {
	for i := 0; i < len(modules.AppConfig.Addons); i++ {
		switch addonName := modules.AppConfig.Addons[i]; addonName {
		case "docker":
			docker.Setup()
		case "health-check-server":
			healthcheckserver.Setup()
		}
	}
}
