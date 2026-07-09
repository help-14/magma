<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { getWeather } from '$lib/remotes/weather.remote.js'
  import * as Tooltip from '$lib/components/ui/tooltip/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { getWeatherIcon } from '$lib/assets/weather-icons.js'
  import type { WeatherWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: WeatherWidgetProps = $props()
  let weather = $state<any>(null)

  let w = $derived(widget.w ?? 0)
  let h = $derived(widget.h ?? 0)

  let size = $derived(
    compact
      ? 'small'
      : w <= 3 && h <= 2
        ? 'small'
        : w >= 4 && h >= 4
          ? 'large'
          : 'medium'
  )

  let iconPx = $derived(
    size === 'small' ? (compact ? 36 : 52) : size === 'medium' ? 48 : 64
  )

  let stats = $derived(
    weather
      ? [
          {
            label: m.weather_feels_like(),
            value: toCelsius(weather.main?.feels_like)
          },
          ...(weather.main?.temp_min != null
            ? [
                {
                  label: m.weather_min(),
                  value: toCelsius(weather.main?.temp_min)
                }
              ]
            : []),
          ...(weather.main?.temp_max != null
            ? [
                {
                  label: m.weather_max(),
                  value: toCelsius(weather.main?.temp_max)
                }
              ]
            : []),
          {
            label: m.weather_humidity(),
            value: `${weather.main?.humidity ?? '--'}%`
          },
          {
            label: m.weather_wind(),
            value: formatWind(weather.wind?.speed, weather.wind?.deg)
          },
          { label: m.weather_sky(), value: weather.weather?.[0]?.main || '' },
          ...(weather.visibility != null
            ? [
                {
                  label: m.weather_visibility(),
                  value: formatVisibility(weather.visibility)
                }
              ]
            : [])
        ]
      : []
  )

  $effect(() => {
    const cfg = widget.config || {}
    const lat = cfg.latitude ?? 0
    const lon = cfg.longitude ?? 0
    if (lat === 0 && lon === 0 && !cfg.cityName) return
    let cancelled = false
    getWeather({
      provider: cfg.provider || 'open-meteo',
      apiKey: cfg.apiKey || '',
      cityName: cfg.cityName || '',
      latitude: lat,
      longitude: lon,
      cacheTtl: (cfg.cacheTtl || 900) * 1000
    })
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
    if (value == null) return '--°C'
    return `${Math.floor(value - 273.15)}°C`
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

  function formatWind(
    speed: number | null | undefined,
    deg: number | null | undefined
  ) {
    if (speed == null) return '--'
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const dir = directions[Math.round((deg || 0) / 45) % 8]
    return `${speed}m/s · ${dir}`
  }
</script>

{#if size === 'small'}
  <div
    class="relative flex flex-col justify-center p-4 pl-1 w-full min-w-0 min-h-0"
  >
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger
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
              class="shrink-0 rounded-full bg-accent/20"
              style="width: {iconPx}px; height: {iconPx}px"
            ></div>
          {/if}
          <div>
            <strong class="block text-2xl leading-none"
              >{weather ? toCelsius(weather.main?.temp) : '--°C'}</strong
            >
            <span class="text-muted-foreground text-xs"
              >{weather?.name || 'Weather'} · {weather?.main?.humidity ??
                '--'}%</span
            >
          </div>
        </Tooltip.Trigger>
        {#if weather}
          <Tooltip.Content
            side="right"
            align="start"
            sideOffset={12}
            class="w-64 bg-popover border-border shadow-[0_12px_40px_rgb(0_0_0/40%)] backdrop-blur-xl ring-0 text-xs leading-relaxed text-foreground p-3 flex flex-col items-stretch gap-0"
            arrowClasses="bg-popover fill-popover border-border"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="font-bold">{weather.name}</span>
            </div>
            <hr class="border-border/50 my-1.5" />
            <div class="grid grid-cols-2 gap-x-3 gap-y-1">
              <span class="text-muted-foreground"
                >{m.weather_temperature()}</span
              >
              <span>{toCelsius(weather.main?.temp)}</span>
              <span class="text-muted-foreground">{m.weather_feels_like()}</span
              >
              <span>{toCelsius(weather.main?.feels_like)}</span>
              {#if weather.main?.temp_min != null}
                <span class="text-muted-foreground">{m.weather_min()}</span>
                <span>{toCelsius(weather.main?.temp_min)}</span>
              {/if}
              {#if weather.main?.temp_max != null}
                <span class="text-muted-foreground">{m.weather_max()}</span>
                <span>{toCelsius(weather.main?.temp_max)}</span>
              {/if}
              <span class="text-muted-foreground">{m.weather_humidity()}</span>
              <span>{weather.main?.humidity}%</span>
              <span class="text-muted-foreground">{m.weather_wind()}</span>
              <span>{weather.wind?.speed}m/s at {weather.wind?.deg}°</span>
              <span class="text-muted-foreground">{m.weather_sky()}</span>
              <span>{weather.weather?.[0]?.main || ''}</span>
              {#if weather.visibility != null}
                <span class="text-muted-foreground"
                  >{m.weather_visibility()}</span
                >
                <span>{formatVisibility(weather.visibility)}</span>
              {/if}
              {#if weather.sys?.sunrise}
                <span class="text-muted-foreground">{m.weather_sunrise()}</span>
                <span>{formatHour(weather.sys?.sunrise)}</span>
              {/if}
              {#if weather.sys?.sunset}
                <span class="text-muted-foreground">{m.weather_sunset()}</span>
                <span>{formatHour(weather.sys?.sunset)}</span>
              {/if}
            </div>
          </Tooltip.Content>
        {/if}
      </Tooltip.Root>
    </Tooltip.Provider>
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
        <strong class="block text-2xl leading-none"
          >{toCelsius(weather.main?.temp)}</strong
        >
        <span class="text-muted-foreground text-xs"
          >{weather.name || 'Weather'} · {weather.main?.humidity ?? '--'}%</span
        >
      </div>
    </div>

    <div
      class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs leading-snug"
    >
      {#each stats as stat (stat.label)}
        <span class="text-muted-foreground whitespace-nowrap">{stat.label}</span
        >
        <span>{stat.value}</span>
      {/each}
    </div>

    {#if size === 'large'}
      {#if weather.sys?.sunrise || weather.sys?.sunset}
        <hr class="border-border/50 my-0.5" />
        <div class="flex items-center justify-between text-xs">
          {#if weather.sys?.sunrise}
            <span class="text-muted-foreground"
              >{m.weather_sunrise()} {formatHour(weather.sys?.sunrise)}</span
            >
          {/if}
          {#if weather.sys?.sunset}
            <span class="text-muted-foreground"
              >{m.weather_sunset()} {formatHour(weather.sys?.sunset)}</span
            >
          {/if}
        </div>
      {/if}
    {/if}
  </div>
{/if}
