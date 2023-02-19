package modules

import (
	"fmt"
	"index/suffixarray"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"gopkg.in/yaml.v2"
)

type ContentData struct {
	Data []GroupData `yaml:"data"`
}

type GroupData struct {
	Title   string       `yaml:"title"`
	Columns []ColumnData `yaml:"columns"`
	Icon    string       `yaml:"icon"`
}

type ColumnData struct {
	Title     string         `yaml:"title"`
	Bookmarks []BookmarkData `yaml:"bookmarks"`
	Icon      string         `yaml:"icon"`
}

type BookmarkData struct {
	Name     string `yaml:"name"`
	Url      string `yaml:"url"`
	UrlLocal string `yaml:"urlLocal"`
	Icon     string `yaml:"icon"`
	IsLocal  bool   `yaml:"isLocal"`
}

func LoadContent() ContentData {
	emptyData := ContentData{}

	file, err := os.Open(filepath.Join("data", "data.yaml"))
	if err != nil {
		fmt.Printf("failed reading file: %s", err)
		return emptyData
	}
	defer file.Close()
	yamlFile, err := io.ReadAll(file)
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

func contains(str string, subStrs ...string) bool {
	if len(subStrs) == 0 {
		return true
	}
	r := regexp.MustCompile(strings.Join(subStrs, "|"))
	index := suffixarray.New([]byte(str))
	res := index.FindAllIndex(r, -1)
	exists := make(map[string]int)
	for _, v := range subStrs {
		exists[v] = 1
	}
	for _, pair := range res {
		s := str[pair[0]:pair[1]]
		exists[s] = exists[s] + 1
	}
	for _, v := range exists {
		if v == 1 {
			return false
		}
	}
	return true
}

func (b *BookmarkData) IsSVG() bool {
	return strings.Contains(b.Icon, ".svg")
}

func (b *BookmarkData) IsImage() bool {
	return contains(b.Icon, ".jpg", ".jpeg", ".png", ".gif", ".apng", ".bmp", ".ico", ".webp")
}

func (b *GroupData) IsSVG() bool {
	return strings.Contains(b.Icon, ".svg")
}

func (b *GroupData) IsImage() bool {
	return contains(b.Icon, ".jpg", ".jpeg", ".png", ".gif", ".apng", ".bmp", ".ico", ".webp")
}

func (b *ColumnData) IsSVG() bool {
	return strings.Contains(b.Icon, ".svg")
}

func (b *ColumnData) IsImage() bool {
	return contains(b.Icon, ".jpg", ".jpeg", ".png", ".gif", ".apng", ".bmp", ".ico", ".webp")
}
