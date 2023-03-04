package modules

import (
	"fmt"
	"net/http"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

func SetupLanguage(mux *http.ServeMux) {
	languagefs := http.FileServer(http.Dir(filepath.Join(CurrentPath(), "languages")))
	mux.Handle("/languages/", http.StripPrefix("/languages/", languagefs))
}

type Language struct {
	Greeting LanguageGreeting `yaml:"greeting"`
	Weather  LanguageWeather  `yaml:"weather"`
}

type LanguageGreeting struct {
	Morning   string `yaml:"morning"`
	Afternoon string `yaml:"afternoon"`
	Evening   string `yaml:"evening"`
	Night     string `yaml:"night"`
}

type LanguageWeather struct {
	Thunderstorm      string `yaml:"thunderstorm"`
	Drizzle           string `yaml:"drizzle"`
	Rain              string `yaml:"rain"`
	Snow              string `yaml:"snow"`
	ClearDay          string `yaml:"clear-day"`
	ClearNight        string `yaml:"clear-night"`
	Cloudy            string `yaml:"cloudy"`
	PartlyCloudyDay   string `yaml:"partly-cloudy-day"`
	PartlyCloudyNight string `yaml:"partly-cloudy-night"`
	Sleet             string `yaml:"sleet"`
	Windy             string `yaml:"windy"`
	Foggy             string `yaml:"foggy"`
}

func LoadLanguage(language string) Language {
	yamlFile, err := ReadFile(filepath.Join("languages", language+".yaml"))
	if err != nil {
		fmt.Printf("Error reading YAML file: %s\n", err)
		return LoadLanguage("en")
	}

	var data Language
	err = yaml.Unmarshal(yamlFile, &data)
	if err != nil {
		fmt.Printf("Error parsing YAML file: %s\n", err)
		return LoadLanguage("en")
	}

	fmt.Println("Loaded language: ", language)
	return data
}
