<script>
  // @ts-nocheck
  import { MapPin } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { getWeather } from '$lib/remotes/weather.remote.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { getWeatherIcon } from '$lib/assets/weather-icons.js'

  /** @type {import('$lib/types/widget.js').WeatherWidgetProps} */
  let { widget, locations = {}, compact = false } = $props()
  let weather = $state(null)

  // getWeatherIcon moved to $lib/assets/weather-icons.js

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
