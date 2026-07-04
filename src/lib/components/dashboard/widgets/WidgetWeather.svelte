<script lang="ts">
  import { MapPin } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { getWeather } from '$lib/remotes/weather.remote.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { getWeatherIcon } from '$lib/assets/weather-icons.js'
  import type { WeatherWidgetProps } from '$lib/types/widget.js'

  let { widget, locations = {}, compact = false }: WeatherWidgetProps = $props()
  let weather = $state<any>(null)

  let w = $derived(widget.w ?? 0)
  let h = $derived(widget.h ?? 0)

  let size = $derived(
    compact ? 'small' :
    w <= 3 && h <= 2 ? 'small' :
    w >= 4 && h >= 4 ? 'large' :
    'medium'
  )

  let iconPx = $derived(
    size === 'small' ? (compact ? 36 : 52) :
    size === 'medium' ? 48 :
    64
  )

  let stats = $derived(weather ? [
    { label: m.weather_feels_like(), value: toCelsius(weather.main?.feels_like) },
    { label: m.weather_min(), value: toCelsius(weather.main?.temp_min) },
    { label: m.weather_max(), value: toCelsius(weather.main?.temp_max) },
    { label: m.weather_humidity(), value: `${weather.main?.humidity ?? '--'}%` },
    { label: m.weather_wind(), value: formatWind(weather.wind?.speed, weather.wind?.deg) },
    { label: m.weather_sky(), value: weather.weather?.[0]?.main || '' },
    { label: m.weather_visibility(), value: formatVisibility(weather.visibility) },
  ] : [])

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

  function toCelsius(value: number | null | undefined) {
    return `${Math.floor((value || 0) - 273.15)}°C`
  }

  function formatHour(timestamp: number | null | undefined) {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatVisibility(meters: number | null | undefined) {
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

  function formatWind(speed: number | null | undefined, deg: number | null | undefined) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const dir = directions[Math.round((deg || 0) / 45) % 8]
    return `${speed ?? '--'}m/s · ${dir}`
  }
</script>

{#if size === 'small'}
  <div class="relative flex flex-col justify-center p-4 pl-1 w-full min-w-0 min-h-0">
    <Popover.Root>
      <Popover.Trigger
        class="flex flex-row items-center content-center justify-center gap-2 w-full cursor-pointer bg-transparent border-0 p-0 text-left"
        title={m.weather_click()}
      >
        {#if weather}
          <img
            src={getWeatherIcon(weather.weather?.[0]?.id ?? 0)}
            alt={weather.weather?.[0]?.description || m.weather_temperature()}
            width={iconPx}
            height={iconPx}
            class="shrink-0"
          />
        {:else}
          <div
            class="shrink-0 rounded-full bg-magma-accent/20"
            style="width: {iconPx}px; height: {iconPx}px"
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
{:else if weather}
  <div class="relative flex flex-col h-full overflow-hidden p-3 gap-2">
    <div class="flex items-center gap-3 shrink-0">
      <img
        src={getWeatherIcon(weather.weather?.[0]?.id ?? 0)}
        alt={weather.weather?.[0]?.description || m.weather_temperature()}
        width={iconPx}
        height={iconPx}
        class="shrink-0"
      />
      <div>
        <strong class="block text-2xl leading-none">{toCelsius(weather.main?.temp)}</strong>
        <span class="text-magma-muted text-xs">{weather.name || 'Weather'} · {weather.main?.humidity ?? '--'}%</span>
      </div>
    </div>

    <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs leading-snug">
      {#each stats as stat (stat.label)}
        <span class="text-magma-muted whitespace-nowrap">{stat.label}</span>
        <span>{stat.value}</span>
      {/each}
    </div>

    {#if size === 'large'}
      <hr class="border-magma-line/50 my-0.5" />
      <div class="flex items-center justify-between text-xs">
        <span class="text-magma-muted">{m.weather_sunrise()} {formatHour(weather.sys?.sunrise)}</span>
        <span class="text-magma-muted">{m.weather_sunset()} {formatHour(weather.sys?.sunset)}</span>
      </div>
      <Button
        variant="ghost"
        class="w-full py-1.5 rounded-md bg-magma-accent/14 text-magma-accent text-xs font-bold hover:bg-magma-accent/24"
        onclick={getLocation}
      >
        {m.weather_update_location()}
      </Button>
    {/if}
  </div>
{/if}
