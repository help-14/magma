package modules

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

type Language struct {
	Greeting LanguageGreeting `yaml:"greeting"`
}

type LanguageGreeting struct {
	Morning   string `yaml:"morning"`
	Afternoon string `yaml:"afternoon"`
	Evening   string `yaml:"evening"`
	Night     string `yaml:"night"`
}

func LoadLanguage(language string) Language {
	yamlFile, err := ioutil.ReadFile(filepath.Join("languages", language+".yaml"))
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
