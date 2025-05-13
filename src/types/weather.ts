export type WeatherInfo = {
  id: number
  main: string
  description: string
  icon: string
}

export type WeatherApi = {
  coord: { lon: number; lat: number }
  weather: WeatherInfo[]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: { speed: number; deg: number }
  clouds: { all: number }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}
