package modules

import (
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"

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
	Url  string `yaml:"url"`

	Icon string `yaml:"icon"`
}

func (b *BookmarkData) IsSVG() bool {
	return strings.Contains(b.Icon, ".svg")
}

func LoadContent() ContentData {
	emptyData := ContentData{}

	yamlFile, err := ioutil.ReadFile(filepath.Join("data", "data.yaml"))
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
