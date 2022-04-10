# Create new theme

## Preparing

If you are a developer, you know what you are doing then considering public your theme to Magma repo for everybody to use. Fork magma repo, create a folder in `/src/themes/` and add your theme there. Test your theme carefully before create a `Pull Request`.

If you are not a developer, you can start from `src/themes/custom` and use it as a starter kit.

## Your first theme

Your `index.html` will be a [Go template](https://pkg.go.dev/text/template) file. Just like a normal html but with Go actions in `{{}}` to render the data. Currently those data will be pass to you in runtime:

|Name|Type|Description|
|-|-|-|
|Config|WebsiteConfig|Configuration defined in `/common/config.yaml` |
|Language|Language|Current language loaded from `/languages/en.yaml`|
|Contents|GroupData[]|Array of content defined in `/common/data.yaml`|

```
type WebsiteConfig struct {
	Title        string `yaml:"title"`
	Description  string `yaml:"description"`
	Language     string `yaml:"language"`
	Localization string `yaml:"localization"`
	UseMetric    bool   `yaml:"useMetric"`
	Theme        string `yaml:"theme"`
}
```

```
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
```