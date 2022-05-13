# Configuration

Your configuration is in `/data/config.yaml` and should look like this:

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
| openweathermap | Object | Weather configuration                               |
| addons  | Array  | List of addons to run. E.g: `docker, health-check-server, ...` |

## Website configuration:

| Field        | Type    | Meaning |
| ------------ | ------- | - |
| theme        | string  | Name of your selected theme, default is `flame` |
| title        | string  | Title of your website, will be inject into `<title></title>` |
| description  | string  | Description of your website, will be inject into `<meta name="description" content="" />` |
| language     | string  | Selected language file in `/languages` without `.yaml` extension. |
| localization | string  | Localization that will be use to show date/time |
| useMetric    | boolean | Set to `true` to use `°C`, `false` to use `°F` |

## Weather configuration 
| Field        | Type    | Meaning |
| ------------ | ------- | - |
| apiKey | string | API key from [OpenWeatherMap](https://openweathermap.org/current). You'll need to create an account to get one. |
| lon | string | Longitude of your [current address](https://www.gps-latitude-longitude.com/gps-coordinates-of-mine) |
| lat | string | Latitude of your [current address](https://www.gps-latitude-longitude.com/gps-coordinates-of-mine) |