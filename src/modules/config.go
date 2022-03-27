package config

type YamlConfig struct {
	website WebsiteConfig
	addons  []string
}

type WebsiteConfig struct {
	title        string
	description  string
	language     string
	localization string
	useMetric    bool
	theme        string
}

func LoadConfig() YamlConfig {
	defaultConfig := YamlConfig{
		website: WebsiteConfig{
			title:        "Magma Dashboard",
			description:  "",
			language:     "en",
			localization: "en-us",
			useMetric:    true,
			theme:        "flame",
		},
		addons: []string{},
	}

	// yamlFile, err := ioutil.ReadFile("./public/config.yaml")
	// if err != nil {
	// 	fmt.Printf("Error reading YAML file: %s\n", err)
	// 	return defaultConfig
	// }
	return defaultConfig
	// fmt.Printf("YAML file: %s\n", yamlFile)

	// var yamlConfig YamlConfig
	// err = yaml.Unmarshal(yamlFile, &yamlConfig)
	// if err != nil {
	// 	fmt.Printf("Error parsing YAML file: %s\n", err)
	// 	return defaultConfig
	// }

	// fmt.Printf(yamlConfig.website.title)
	// fmt.Printf("%+v\n", yamlConfig)
	// fmt.Printf("%+v\n", defaultConfig)
	// return yamlConfig
}
