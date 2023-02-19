package main

import (
	"errors"
	"fmt"
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
	mux := http.NewServeMux()

	modules.SetupLanguage(mux)
	modules.SetupTemplate(mux)
	modules.SetupWeather(mux)
	//loadAddons()

	server := http.Server{
		Addr:    fmt.Sprintf(":%d", 7001),
		Handler: mux,
	}
	log.Println("Listening on http://localhost:7001 ...")
	if err := server.ListenAndServe(); err != nil {
		if !errors.Is(err, http.ErrServerClosed) {
			fmt.Printf("error running http server: %s\n", err)
		}
	}
	// err := http.ListenAndServe(":7001", nil)
	// if err != nil {
	// 	log.Fatal(err)
	// }
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
