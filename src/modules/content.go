package modules

import (
	"fmt"
	"io/ioutil"
	"path/filepath"

	"gopkg.in/yaml.v2"
)

type ContentData struct {
	Data []GroupData `yaml:"data"`
}

type GroupData struct {
	Title   string       `yaml:"title"`
	Columns []ColumnData `yaml:"columns"`
}

type ColumnData struct {
	Title     string         `yaml:"title"`
	Bookmarks []BookmarkData `yaml:"bookmarks"`
}

type BookmarkData struct {
	Name string `yaml:"name"`
	Icon string `yaml:"icon"`
	Url  string `yaml:"url"`
}

func LoadContent() ContentData {
	emptyData := ContentData{}

	yamlFile, err := ioutil.ReadFile(filepath.Join("common", "data.yaml"))
	if err != nil {
		fmt.Printf("Error reading YAML file: %s\n", err)
		return emptyData
	}

	var data ContentData
	err = yaml.Unmarshal(yamlFile, &data)
	if err != nil {
		fmt.Printf("Error parsing YAML file: %s\n", err)
		return emptyData
	}
	return data
}
