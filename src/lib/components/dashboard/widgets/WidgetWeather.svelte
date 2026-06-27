<script>
  // @ts-nocheck
  import { MapPin } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { getWeather } from '$lib/remotes/weather.remote.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'

  import thunderstorms from '$lib/assets/weather-icons/thunderstorms.svg'
  import thunderstormsDay from '$lib/assets/weather-icons/thunderstorms-day.svg'
  import thunderstormsNight from '$lib/assets/weather-icons/thunderstorms-night.svg'
  import thunderstormsDayRain from '$lib/assets/weather-icons/thunderstorms-day-rain.svg'
  import thunderstormsNightRain from '$lib/assets/weather-icons/thunderstorms-night-rain.svg'
  import thunderstormsDayExtremeRain from '$lib/assets/weather-icons/thunderstorms-day-extreme-rain.svg'
  import thunderstormsNightExtremeRain from '$lib/assets/weather-icons/thunderstorms-night-extreme-rain.svg'
  import drizzle from '$lib/assets/weather-icons/drizzle.svg'
  import partlyDayDrizzle from '$lib/assets/weather-icons/partly-cloudy-day-drizzle.svg'
  import partlyNightDrizzle from '$lib/assets/weather-icons/partly-cloudy-night-drizzle.svg'
  import overcastDayDrizzle from '$lib/assets/weather-icons/overcast-day-drizzle.svg'
  import overcastNightDrizzle from '$lib/assets/weather-icons/overcast-night-drizzle.svg'
  import extremeDayDrizzle from '$lib/assets/weather-icons/extreme-day-drizzle.svg'
  import extremeNightDrizzle from '$lib/assets/weather-icons/extreme-night-drizzle.svg'
  import rain from '$lib/assets/weather-icons/rain.svg'
  import extremeDayRain from '$lib/assets/weather-icons/extreme-day-rain.svg'
  import extremeNightRain from '$lib/assets/weather-icons/extreme-night-rain.svg'
  import partlyDayRain from '$lib/assets/weather-icons/partly-cloudy-day-rain.svg'
  import partlyNightRain from '$lib/assets/weather-icons/partly-cloudy-night-rain.svg'
  import overcastDayRain from '$lib/assets/weather-icons/overcast-day-rain.svg'
  import overcastNightRain from '$lib/assets/weather-icons/overcast-night-rain.svg'
  import sleet from '$lib/assets/weather-icons/sleet.svg'
  import hail from '$lib/assets/weather-icons/hail.svg'
  import snow from '$lib/assets/weather-icons/snow.svg'
  import overcastDaySnow from '$lib/assets/weather-icons/overcast-day-snow.svg'
  import overcastNightSnow from '$lib/assets/weather-icons/overcast-night-snow.svg'
  import extremeDaySnow from '$lib/assets/weather-icons/extreme-day-snow.svg'
  import extremeNightSnow from '$lib/assets/weather-icons/extreme-night-snow.svg'
  import mist from '$lib/assets/weather-icons/mist.svg'
  import smoke from '$lib/assets/weather-icons/smoke.svg'
  import haze from '$lib/assets/weather-icons/haze.svg'
  import dust from '$lib/assets/weather-icons/dust.svg'
  import hurricane from '$lib/assets/weather-icons/hurricane.svg'
  import cloudy from '$lib/assets/weather-icons/cloudy.svg'
  import thermometer from '$lib/assets/weather-icons/thermometer.svg'
  import fogDay from '$lib/assets/weather-icons/fog-day.svg'
  import fogNight from '$lib/assets/weather-icons/fog-night.svg'
  import clearDay from '$lib/assets/weather-icons/clear-day.svg'
  import clearNight from '$lib/assets/weather-icons/clear-night.svg'
  import cloudyDay from '$lib/assets/weather-icons/partly-cloudy-day.svg'
  import cloudyNight from '$lib/assets/weather-icons/partly-cloudy-night.svg'

  /** @type {import('$lib/types/widget.js').WeatherWidgetProps} */
  let { widget, locations = {}, compact = false } = $props()
  let weather = $state(null)

  function getWeatherIcon(weatherCode) {
    let hour = new Date().getHours()
    let isDay = hour >= 6 && hour < 18

    if (weatherCode >= 200 && weatherCode < 300) {
      switch (weatherCode) {
        case 200:
        case 210:
        case 201:
        case 202:
          return isDay ? thunderstormsDayRain : thunderstormsNightRain
        case 211:
        case 212:
          return isDay ? thunderstormsDay : thunderstormsNight
        case 221:
        case 231:
        case 232:
          return isDay
            ? thunderstormsDayExtremeRain
            : thunderstormsNightExtremeRain
        default:
          return thunderstorms
      }
    }

    if (weatherCode >= 300 && weatherCode < 400) {
      switch (weatherCode) {
        case 300:
        case 301:
        case 302:
          return isDay ? partlyDayDrizzle : partlyNightDrizzle
        case 310:
        case 311:
          return isDay ? overcastDayDrizzle : overcastNightDrizzle
        case 312:
        case 313:
        case 314:
        case 321:
          return isDay ? extremeDayDrizzle : extremeNightDrizzle
        default:
          return drizzle
      }
    }

    if (weatherCode >= 500 && weatherCode < 600) {
      switch (weatherCode) {
        case 500:
        case 501:
          return isDay ? partlyDayRain : partlyNightRain
        case 502:
        case 503:
        case 504:
          return isDay ? overcastDayRain : overcastNightRain
        case 511:
          return sleet
        case 520:
        case 521:
        case 522:
        case 531:
          return isDay ? extremeDayRain : extremeNightRain
        default:
          return rain
      }
    }

    if (weatherCode >= 600 && weatherCode < 700) {
      switch (weatherCode) {
        case 600:
          return hail
        case 601:
        case 602:
          return isDay ? overcastDaySnow : overcastNightSnow
        case 611:
        case 612:
        case 613:
          return sleet
        case 615:
        case 616:
          return sleet
        case 620:
        case 621:
        case 622:
          return isDay ? extremeDaySnow : extremeNightSnow
        default:
          return snow
      }
    }

    switch (weatherCode) {
      case 701:
        return mist
      case 711:
        return smoke
      case 721:
        return haze
      case 731:
      case 751:
      case 761:
      case 762:
        return dust
      case 741:
        return isDay ? fogDay : fogNight
      case 771:
      case 781:
        return hurricane
      case 800:
        return isDay ? clearDay : clearNight
      case 801:
      case 802:
        return isDay ? cloudyDay : cloudyNight
      case 803:
      case 804:
        return cloudy
      default:
        return thermometer
    }
  }

  $effect(() => {
    const location = locations[widget.config?.locationRef || 'default']
    if (!location) return
    let cancelled = false
    getWeather({ latitude: location.latitude, longitude: location.longitude })
      .then((data) => {
        if (!cancelled) weather = data
      })
      .catch(() => {
        if (!cancelled) weather = null
      })
    return () => {
      cancelled = true
    }
  })

  function toCelsius(value) {
    return `${Math.floor((value || 0) - 273.15)}°C`
  }

  function formatHour(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatVisibility(meters) {
    if (meters == null) return ''
    if (meters > 1000) return `${Math.floor(meters / 1000)}km`
    return `${meters}m`
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = locations[widget.config?.locationRef || 'default']
        if (!loc) return
        loc.latitude = position.coords.latitude
        loc.longitude = position.coords.longitude
      })
    }
  }
</script>

<div
  class="relative flex flex-col justify-center p-4 pl-1 w-full min-w-0 min-h-0"
>
  <Popover.Root>
    <Popover.Trigger
      class="flex flex-row items-center content-center justify-center gap-2 w-full cursor-pointer bg-transparent border-0 p-0 text-left"
      title={m.weather_click()}
    >
      {#if weather}
        <img
          src={getWeatherIcon(weather.weather?.[0]?.id ?? 0)}
          alt={weather.weather?.[0]?.description || m.weather_temperature()}
          width={compact ? 36 : 52}
          height={compact ? 36 : 52}
          class="shrink-0"
        />
      {:else}
        <div
          class="shrink-0 rounded-full bg-magma-accent/20"
          style={`width: ${compact ? 36 : 52}px; height: ${compact ? 36 : 52}px`}
        ></div>
      {/if}
      <div>
        <strong class="block text-2xl leading-none"
          >{weather ? toCelsius(weather.main?.temp) : '--°C'}</strong
        >
        <span class="text-magma-muted text-xs"
          >{weather?.name || 'Weather'} · {weather?.main?.humidity ??
            '--'}%</span
        >
      </div>
    </Popover.Trigger>
    {#if weather}
      <Popover.Content
        side="right"
        align="start"
        sideOffset={12}
        class="w-64 bg-magma-panel-strong border-magma-line shadow-[0_12px_40px_rgb(0_0_0/40%)] backdrop-blur-xl ring-0 text-xs leading-relaxed p-3"
      >
        <div class="flex items-center gap-2 mb-2">
          <MapPin size={14} class="text-magma-accent shrink-0" />
          <span class="font-bold"
            >{weather.name}, {weather.sys?.country || ''}</span
          >
        </div>
        <hr class="border-magma-line/50 my-1.5" />
        <div class="grid grid-cols-2 gap-x-3 gap-y-1">
          <span class="text-magma-muted">{m.weather_temperature()}</span>
          <span>{toCelsius(weather.main?.temp)}</span>
          <span class="text-magma-muted">{m.weather_feels_like()}</span>
          <span>{toCelsius(weather.main?.feels_like)}</span>
          <span class="text-magma-muted">{m.weather_min()}</span>
          <span>{toCelsius(weather.main?.temp_min)}</span>
          <span class="text-magma-muted">{m.weather_max()}</span>
          <span>{toCelsius(weather.main?.temp_max)}</span>
          <span class="text-magma-muted">{m.weather_humidity()}</span>
          <span>{weather.main?.humidity}%</span>
          <span class="text-magma-muted">{m.weather_wind()}</span>
          <span>{weather.wind?.speed}m/s at {weather.wind?.deg}°</span>
          <span class="text-magma-muted">{m.weather_sky()}</span>
          <span>{weather.weather?.[0]?.main || ''}</span>
          <span class="text-magma-muted">{m.weather_visibility()}</span>
          <span>{formatVisibility(weather.visibility)}</span>
          <span class="text-magma-muted">{m.weather_sunrise()}</span>
          <span>{formatHour(weather.sys?.sunrise)}</span>
          <span class="text-magma-muted">{m.weather_sunset()}</span>
          <span>{formatHour(weather.sys?.sunset)}</span>
        </div>
        <Button
          variant="ghost"
          class="mt-2 w-full py-1.5 rounded-md bg-magma-accent/14 text-magma-accent text-xs font-bold hover:bg-magma-accent/24"
          onclick={getLocation}
        >
          {m.weather_update_location()}
        </Button>
      </Popover.Content>
    {/if}
  </Popover.Root>
</div>
