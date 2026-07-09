import { query } from '$app/server'
import * as v from 'valibot'
import { createCache, stableCacheKey } from '$lib/server/cache.js'

const cache = createCache(900_000, 50)

const weatherProviders = ['open-meteo', 'weatherapi', 'openweathermap'] as const
type WeatherProvider = (typeof weatherProviders)[number]
type GeocodedCity = { name: string; latitude: number; longitude: number }

function isWeatherProvider(v: string): v is WeatherProvider {
  return weatherProviders.includes(v as WeatherProvider)
}

export const getWeather = query(
  v.object({
    provider: v.optional(v.string(), 'open-meteo'),
    apiKey: v.optional(v.string(), ''),
    cityName: v.optional(v.string(), ''),
    latitude: v.optional(v.number(), 0),
    longitude: v.optional(v.number(), 0),
    cacheTtl: v.optional(v.number(), 900_000)
  }),
  async ({
    provider: rawProvider,
    apiKey,
    cityName,
    latitude,
    longitude,
    cacheTtl
  }) => {
    const provider = isWeatherProvider(rawProvider) ? rawProvider : 'open-meteo'

    let lat = latitude
    let lon = longitude
    let displayName = cityName.trim()

    if (lat === 0 && lon === 0 && cityName) {
      const geo = await geocodeCity(cityName)
      if (geo) {
        lat = geo.latitude
        lon = geo.longitude
        displayName = geo.name
      }
    }

    if (lat === 0 && lon === 0) {
      return mockWeather('Home')
    }

    const cacheKey = stableCacheKey({ provider, lat, lon, displayName })
    return cache.getOrSet(
      cacheKey,
      async () => {
        if (provider === 'open-meteo')
          return fetchOpenMeteo(lat, lon, displayName)
        if (provider === 'weatherapi') {
          if (!apiKey) return mockWeather('Home')
          return fetchWeatherApi(lat, lon, apiKey)
        }

        if (!apiKey) return mockWeather('Home')
        return fetchOpenWeatherMap(lat, lon, apiKey)
      },
      cacheTtl
    )
  }
)

// ── Geocoding ──────────────────────────────────────────────────────────

const geocodeCache = createCache<GeocodedCity | null>(28_800_000, 100)

async function geocodeCity(name: string): Promise<GeocodedCity | null> {
  return geocodeCache.getOrSet(name.trim().toLowerCase(), async () => {
    try {
      const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
      url.searchParams.set('name', name)
      url.searchParams.set('count', '1')
      url.searchParams.set('language', 'en')
      url.searchParams.set('format', 'json')
      const res = await fetch(url)
      if (!res.ok) return null
      const json = await res.json()
      const result = json.results?.[0]
      if (!result) return null
      return {
        name: result.name || name,
        latitude: result.latitude,
        longitude: result.longitude
      }
    } catch {
      return null
    }
  })
}

// ── Open-Meteo ─────────────────────────────────────────────────────────

async function fetchOpenMeteo(lat: number, lon: number, displayName = '') {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m'
  )
  url.searchParams.set(
    'daily',
    'sunrise,sunset,temperature_2m_max,temperature_2m_min'
  )
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url)
  if (!res.ok) return mockWeather('Home')

  const raw = await res.json()
  const cur = raw.current ?? {}
  const day = raw.daily ?? {}

  return {
    name: displayName || extractNameFromTimezone(raw.timezone) || 'Home',
    weather: [
      {
        id: wmoToOwm(cur.weather_code ?? 0),
        main: weatherCodeMain(cur.weather_code ?? 0),
        description: weatherCodeDesc(cur.weather_code ?? 0),
        icon: iconFromCode(cur.weather_code ?? 0)
      }
    ],
    main: {
      temp: celsiusToKelvin(cur.temperature_2m ?? 20),
      feels_like: celsiusToKelvin(
        cur.apparent_temperature ?? cur.temperature_2m ?? 20
      ),
      temp_min:
        day.temperature_2m_min?.[0] != null
          ? celsiusToKelvin(day.temperature_2m_min[0])
          : celsiusToKelvin(cur.temperature_2m ?? 20),
      temp_max:
        day.temperature_2m_max?.[0] != null
          ? celsiusToKelvin(day.temperature_2m_max[0])
          : celsiusToKelvin(cur.temperature_2m ?? 20),
      humidity: cur.relative_humidity_2m ?? 70
    },
    visibility: null as number | null,
    wind: {
      speed: cur.wind_speed_10m ?? 0,
      deg: cur.wind_direction_10m ?? 0
    },
    sys: {
      country: '',
      sunrise: day.sunrise?.[0] ? new Date(day.sunrise[0]).getTime() / 1000 : 0,
      sunset: day.sunset?.[0] ? new Date(day.sunset[0]).getTime() / 1000 : 0
    }
  }
}

// ── WeatherAPI.com ─────────────────────────────────────────────────────

async function fetchWeatherApi(lat: number, lon: number, key: string) {
  const url = new URL('https://api.weatherapi.com/v1/current.json')
  url.searchParams.set('key', key)
  url.searchParams.set('q', `${lat},${lon}`)

  const res = await fetch(url)
  if (!res.ok) return mockWeather('Home')

  const raw = await res.json()
  const cur = raw.current ?? {}
  const loc = raw.location ?? {}

  return {
    name: loc.name || 'Home',
    weather: [
      {
        id: weatherapiToOwm(cur.condition?.code ?? 1000),
        main: cur.condition?.text || 'Clear',
        description: cur.condition?.text || 'clear sky',
        icon: iconFromWeatherapiCode(cur.condition?.code ?? 1000)
      }
    ],
    main: {
      temp: celsiusToKelvin(cur.temp_c ?? 20),
      feels_like: celsiusToKelvin(cur.feelslike_c ?? cur.temp_c ?? 20),
      temp_min: null as number | null,
      temp_max: null as number | null,
      humidity: cur.humidity ?? 70
    },
    visibility:
      cur.vis_km != null
        ? Math.round(cur.vis_km * 1000)
        : (null as number | null),
    wind: {
      speed:
        cur.wind_kph != null ? Math.round((cur.wind_kph / 3.6) * 10) / 10 : 0,
      deg: cur.wind_degree ?? 0
    },
    sys: {
      country: loc.country || '',
      sunrise: 0,
      sunset: 0
    }
  }
}

// ── OpenWeatherMap ─────────────────────────────────────────────────────

async function fetchOpenWeatherMap(lat: number, lon: number, key: string) {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('appid', key)

  const res = await fetch(url)
  if (!res.ok) return mockWeather('Home')

  const raw = await res.json()
  raw.visibility = raw.visibility ?? null
  raw.main = raw.main || {}
  raw.main.temp_min = raw.main.temp_min ?? null
  raw.main.temp_max = raw.main.temp_max ?? null
  return raw
}

// ── Helpers ────────────────────────────────────────────────────────────

function celsiusToKelvin(c: number) {
  return Math.round((c + 273.15) * 100) / 100
}

function extractNameFromTimezone(tz?: string) {
  if (!tz) return null
  const parts = tz.split('/')
  return parts[parts.length - 1]?.replace(/_/g, ' ') || null
}

function wmoToOwm(code: number): number {
  if (code === 0) return 800
  if (code <= 3) return 800 + code
  if (code === 45 || code === 48) return 741
  if (code >= 51 && code <= 55) return 301
  if (code >= 56 && code <= 57) return 302
  if (code >= 61 && code <= 65) return 501
  if (code >= 66 && code <= 67) return 502
  if (code >= 71 && code <= 75) return 601
  if (code === 77) return 602
  if (code >= 80 && code <= 82) return 501
  if (code >= 85 && code <= 86) return 601
  if (code === 95) return 200
  if (code >= 96 && code <= 99) return 202
  return 800
}

function weatherCodeMain(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Clouds'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain'
  if (code >= 85 && code <= 86) return 'Snow'
  if (code >= 95) return 'Thunderstorm'
  return 'Clear'
}

function weatherCodeDesc(code: number): string {
  const map: Record<number, string> = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'foggy',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    56: 'light freezing drizzle',
    57: 'dense freezing drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    66: 'light freezing rain',
    67: 'heavy freezing rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    77: 'snow grains',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    85: 'slight snow showers',
    86: 'heavy snow showers',
    95: 'thunderstorm',
    96: 'thunderstorm with slight hail',
    99: 'thunderstorm with heavy hail'
  }
  return map[code] || 'clear sky'
}

function iconFromCode(code: number): string {
  if (code === 0) return '01d'
  if (code <= 2) return '02d'
  if (code === 3) return '04d'
  if (code >= 45 && code <= 48) return '50d'
  if (code >= 51 && code <= 57) return '09d'
  if (code >= 61 && code <= 65) return '10d'
  if (code >= 66 && code <= 67) return '10d'
  if (code >= 71 && code <= 77) return '13d'
  if (code >= 80 && code <= 82) return '09d'
  if (code >= 85 && code <= 86) return '13d'
  if (code >= 95) return '11d'
  return '01d'
}

const WEATHERAPI_TO_OWM: Record<number, number> = {
  1000: 800,
  1003: 801,
  1006: 802,
  1009: 803,
  1030: 701,
  1063: 500,
  1066: 600,
  1069: 611,
  1072: 611,
  1087: 200,
  1114: 600,
  1117: 602,
  1135: 741,
  1147: 741,
  1150: 300,
  1153: 301,
  1168: 302,
  1171: 302,
  1180: 500,
  1183: 501,
  1186: 502,
  1189: 502,
  1192: 502,
  1195: 502,
  1198: 511,
  1201: 511,
  1204: 611,
  1207: 612,
  1210: 600,
  1213: 601,
  1216: 602,
  1219: 601,
  1222: 602,
  1225: 602,
  1237: 612,
  1240: 500,
  1243: 501,
  1246: 502,
  1249: 611,
  1252: 612,
  1255: 600,
  1258: 601,
  1261: 612,
  1264: 612,
  1273: 200,
  1276: 201,
  1279: 600,
  1282: 601
}

function weatherapiToOwm(code: number): number {
  return WEATHERAPI_TO_OWM[code] ?? 800
}

function iconFromWeatherapiCode(code: number): string {
  return iconFromCode(weatherapiToOwm(code))
}

// ── Mock ───────────────────────────────────────────────────────────────

function mockWeather(name: string) {
  return {
    name,
    weather: [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
    ],
    main: {
      temp: 298.15,
      feels_like: 298.15,
      temp_min: null as number | null,
      temp_max: null as number | null,
      humidity: 70
    },
    visibility: null as number | null,
    wind: { speed: 2.0, deg: 180 },
    sys: { country: '', sunrise: 0, sunset: 0 }
  }
}
