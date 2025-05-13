import {
  createSignal,
  type Component,
  Show,
  createResource,
  createEffect
} from 'solid-js'
import { Coordinate } from '~/types/coords'
import { WeatherApi } from '~/types/weather'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '~/components/ui/hover-card'

const Weather: Component = () => {
  const [coords, setCoords] = createSignal<Coordinate>({
    latitude: 0,
    longitude: 0
  })
  const [visible, setVisible] = createSignal(false)

  function getWeatherIcon(weatherCode: number): string {
    let hour = new Date().getHours()
    let isDay = hour >= 6 && hour < 18
    let dayNight = isDay ? 'day' : 'night'

    if (weatherCode >= 200 && weatherCode < 300) {
      switch (weatherCode) {
        case 200:
        case 210:
        case 201:
        case 202:
          return `/svg/thunderstorms-${dayNight}-rain.svg`
        case 211:
        case 212:
          return `/svg/thunderstorms-${dayNight}.svg`
        case 221:
        case 231:
        case 232:
          return `/svg/thunderstorms-${dayNight}-extreme-rain.svg`
        default:
          return '/svg/thunderstorms.svg'
      }
    }

    if (weatherCode >= 300 && weatherCode < 400) {
      switch (weatherCode) {
        case 300:
        case 301:
        case 302:
          return `/svg/partly-cloudy-${dayNight}-drizzle.svg`
        case 310:
        case 311:
          return `/svg/overcast-${dayNight}-drizzle.svg`
        case 312:
        case 313:
        case 314:
        case 321:
          return `/svg/extreme-${dayNight}-drizzle.svg`
        default:
          return '/svg/drizzle.svg'
      }
    }

    if (weatherCode >= 500 && weatherCode < 600) {
      switch (weatherCode) {
        case 500:
        case 501:
          return `/svg/partly-cloudy-${dayNight}-rain.svg`
        case 502:
        case 503:
        case 504:
          return `/svg/overcast-${dayNight}-rain.svg`
        case 511:
          return '/svg/sleet.svg'
        case 520:
        case 521:
        case 522:
        case 531:
          return `/svg/extreme-${dayNight}-rain.svg`
        default:
          return '/svg/rain.svg'
      }
    }

    if (weatherCode >= 600 && weatherCode < 700) {
      switch (weatherCode) {
        case 600:
          return '/svg/hail.svg'
        case 601:
        case 602:
          return `/svg/overcast-${dayNight}-snow.svg`
        case 611:
        case 612:
        case 613:
          return '/svg/sleet.svg'
        case 615:
        case 616:
          return '/svg/sleet.svg'
        case 620:
        case 621:
        case 622:
          return `/svg/extreme-${dayNight}-snow.svg`
        default:
          return '/svg/snow.svg'
      }
    }

    switch (weatherCode) {
      case 701:
        return '/svg/mist.svg'
      case 711:
        return '/svg/smoke.svg'
      case 721:
        return '/svg/haze.svg'
      case 731:
      case 751:
      case 761:
      case 762:
        return '/svg/dust.svg'
      case 741:
        return `/svg/fog-${dayNight}.svg`
      case 771:
      case 781:
        return '/svg/hurricane.svg'
      case 800:
        return `/svg/clear-${dayNight}.svg`
      case 801:
      case 802:
        return `/svg/partly-cloudy-${dayNight}.svg`
      case 803:
      case 804:
        return '/svg/cloudy.svg'
      default:
        return '/svg/thermometer.svg'
    }
  }

  const fetchWeather = async (): Promise<WeatherApi> => {
    try {
      const data = await (
        await fetch(
          `/api/weather?longitude=${coords().longitude}&latitude=${
            coords().latitude
          }`
        )
      ).json()
      return data
    } catch {
      return {
        coord: { lon: 105.8085, lat: 21.0427 },
        weather: [
          { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
        ],
        base: 'stations',
        main: {
          temp: 304.14,
          feels_like: 311.14,
          temp_min: 304.14,
          temp_max: 304.14,
          pressure: 1009,
          humidity: 74
        },
        visibility: 10000,
        wind: { speed: 2.06, deg: 300 },
        clouds: { all: 0 },
        dt: 1693967516,
        sys: {
          type: 1,
          id: 9308,
          country: 'VN',
          sunrise: 1693953701,
          sunset: 1693998569
        },
        timezone: 25200,
        id: 1581130,
        name: 'Hanoi',
        cod: 200
      }
    }
  }

  const [weather, { refetch }] = createResource<WeatherApi>(fetchWeather)
  createEffect(() => {
    setVisible(weather() != null)
  })

  const toCelsius = (temp: number): string => `${Math.floor(temp - 273.15)}°C`
  const toFahrenheit = (temp: number): string =>
    `${Math.floor(((temp - 32) * 5) / 9)}°F`

  const temp = () => toCelsius(weather()?.main?.temp ?? 0)
  const humidity = () => `${Math.floor(weather()?.main?.humidity ?? 0)}%`
  const weatherCode = () => weather()?.weather[0]?.id ?? 0
  const city = () => weather()?.name
  const visibility = () => {
    if (!weather()) return ''
    let visibility = weather()?.visibility ?? 0
    if (visibility > 1000) return `${Math.floor(visibility / 1000)}km`
    return `${visibility}m`
  }

  function formatHour(timestamp: number): string {
    if (timestamp === 0) return ''
    const date = new Date(timestamp * 1000)
    const opts = {
      minimumIntegerDigits: 2,
      useGrouping: false
    }
    return `${date.getHours().toLocaleString('en-US', opts)}:${date
      .getMinutes()
      .toLocaleString('en-US', opts)}`
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords(position.coords)
        refetch()
      })
    }
  }

  return (
    <>
      <style>
        {`
          hr {
            border: 1px solid var(--foreground);
          }

          div {
            color: var(--foreground);
          }
        `}
      </style>
      <div>
        <HoverCard>
          <HoverCardTrigger>
            <Show when={visible()}>
              <div
                id="weather-button"
                class="hidden md:flex flex-row button p-3"
                title="Click to refresh location"
                onclick={getLocation}
                data-tooltip-target="weather-tooltip"
              >
                <div class="mr-3 my-auto">
                  <img
                    src={getWeatherIcon(weatherCode())}
                    alt="logo"
                    width="60px"
                    height="60px"
                  />
                </div>
                <div id="weather-info" class="flex-col mx-2 my-auto flex">
                  <div id="temp text-center">{temp()}</div>
                  <hr class="my-1" />
                  <div id="humidity text-center">{humidity()}</div>
                </div>
              </div>
            </Show>
          </HoverCardTrigger>
          <HoverCardContent>
            <div
              id="weather-tooltip"
              class="text-sm font-medium rounded-lg shadow-sm"
            >
              <div class="flex flex-col">
                <div class="flex flex-row">
                  <div class="p-2 my-auto w-8" title="Location">
                    <i class="fa-solid fa-location-dot mx-auto"></i>
                  </div>
                  <div class="flex flex-col ml-2">
                    <div>
                      <span class="">Name:</span>
                      <span class="font-thin mx-2">{city()}</span>
                    </div>
                    <div>
                      <span class="">Country:</span>
                      <span class="font-thin mx-2">
                        {weather()?.sys?.country}
                      </span>
                    </div>
                  </div>
                </div>
                <hr class="my-1 opacity-50" />
                <div class="flex flex-row">
                  <div class="p-2 my-auto w-8" title="Temperature">
                    <i class="fa-solid fa-temperature-three-quarters mx-auto"></i>
                  </div>
                  <div class="flex flex-col ml-2">
                    <div>
                      <span class="">Temp:</span>
                      <span class="font-thin mx-2">{temp()}</span>
                    </div>
                    <div>
                      <span class="">Feel like:</span>
                      <span class="font-thin mx-2">
                        {toCelsius(weather()?.main?.feels_like ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span class="">Min:</span>
                      <span class="font-thin mx-2">
                        {toCelsius(weather()?.main?.temp_min ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span class="">Max:</span>
                      <span class="font-thin mx-2">
                        {toCelsius(weather()?.main.temp_max ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span class="">Humidity:</span>
                      <span class="font-thin mx-2">{humidity()}</span>
                    </div>
                  </div>
                </div>
                <hr class="my-1 opacity-50" />
                <div class="flex flex-row">
                  <div class="p-2 my-auto w-8" title="Wind">
                    <i class="fa-solid fa-wind mx-auto"></i>
                  </div>
                  <div class="flex flex-col ml-2">
                    <div>
                      <span class="">Speed:</span>
                      <span class="font-thin mx-2">
                        {weather()?.wind.speed + 'm/s'}
                      </span>
                    </div>
                    <div>
                      <span class="">Degree:</span>
                      <span class="font-thin mx-2">{weather()?.wind.deg}</span>
                    </div>
                  </div>
                </div>
                <hr class="my-1 opacity-50" />
                <div class="flex flex-row">
                  <div class="p-2 my-auto w-8" title="Sky">
                    <i class="fa-solid fa-cloud mx-auto"></i>
                  </div>
                  <div class="flex flex-col ml-2">
                    <div>
                      <span class="">Sky:</span>
                      <span class="font-thin mx-2">
                        {weather()?.weather[0].main}
                      </span>
                    </div>
                    <div>
                      <span class="">Visibility:</span>
                      <span class="font-thin mx-2">{visibility()}</span>
                    </div>
                  </div>
                </div>
                <hr class="my-1 opacity-50" />
                <div class="flex flex-row">
                  <div class="p-2 my-auto w-8" title="Sun">
                    <i class="fa-solid fa-sun mx-auto"></i>
                  </div>
                  <div class="flex flex-col ml-2">
                    <div>
                      <span class="">Sunrise:</span>
                      <span class="font-thin mx-2">
                        {formatHour(weather()?.sys.sunrise ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span class="">Sunset:</span>
                      <span class="font-thin mx-2">
                        {formatHour(weather()?.sys.sunset ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tooltip-arrow" data-popper-arrow></div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </>
  )
}

export default Weather
