package modules

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

type Config struct {
	Website        WebsiteConfig        `yaml:"website"`
	OpenWeatherMap OpenWeatherMapConfig `yaml:"openweathermap"`
	Addons         []string             `yaml:"addons"`
}

type WebsiteConfig struct {
	Title        string `yaml:"title"`
	Description  string `yaml:"description"`
	Language     string `yaml:"language"`
	Localization string `yaml:"localization"`
	UseMetric    bool   `yaml:"useMetric"`
	Theme        string `yaml:"theme"`
}

type OpenWeatherMapConfig struct {
	ApiKey    string `yaml:"apiKey"`
	Longitude string `yaml:"lon"`
	Latitude  string `yaml:"lat"`
}

func LoadConfig() Config {
	defaultConfig := Config{
		Website: WebsiteConfig{
			Title:        "Magma Dashboard",
			Description:  "",
			Language:     "en",
			Localization: "en-us",
			UseMetric:    true,
			Theme:        "flame",
		},
		Addons: []string{},
	}

	yamlFile, err := ioutil.ReadFile("./public/config.yaml")
	if err != nil {
		fmt.Printf("Error reading YAML file: %s\n", err)
		return defaultConfig
	}

	var yamlConfig Config
	err = yaml.Unmarshal(yamlFile, &yamlConfig)
	if err != nil {
		fmt.Printf("Error parsing YAML file: %s\n", err)
		return defaultConfig
	}

	fmt.Println("Loaded config:", yamlConfig)
	return yamlConfig
}
