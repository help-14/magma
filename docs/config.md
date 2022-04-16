# Configuration

Your configuration is in `/data/config.yaml` like this:

```
website:
  theme: "flame"
  title: "Magma Dashboard"
  description: ""
  language: "en"
  localization: "en-US"
  useMetric: true
openweathermap:
  apiKey:
  lon:
  lat:
addons:
```

| Field   | Type   | Meaning                                             |
| ------- | ------ | --------------------------------------------------- |
| website | Object | Website configuration                               |
| addons  | Array  | List of addon to run. E.g: `["addon-1", "addon-2"]` |

Website configuration:

| Field        | Type    | Meaning                                                                                   |
| ------------ | ------- | ----------------------------------------------------------------------------------------- |
| theme        | string  | Name of your selected theme, default is `flame`                                           |
| title        | string  | Title of your website, will be inject into `<title></title>`                              |
| description  | string  | Description of your website, will be inject into `<meta name="description" content="" />` |
| language     | string  | Selected language file in `/languages` without `.yaml` extension.                         |
| localization | string  | Localization that will be use to show date/time                                           |
| useMetric    | boolean | Set to `true` to use `°C`, `false` to use `°F`                                            |