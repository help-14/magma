---
title: Weather Widget
description: Configure Magma weather widgets.
---

# Weather Widget

The Weather widget displays current weather from Open-Meteo, WeatherAPI.com, or OpenWeatherMap.

## Best size

Default palette size: `4 x 4`. Larger sizes can show more weather detail.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `provider` | select | Weather source. Open-Meteo does not require an API key. |
| `apiKey` | password | API key for providers that require one. Prefer environment references. |
| `cityName` | text | City name for geocoding. |
| `latitude` | number | Manual latitude. |
| `longitude` | number | Manual longitude. |
| `cacheTtl` | number | Cache time in seconds. |

## YAML example

```yaml
- id: weather-london
  type: weather
  title: Weather
  x: 0
  y: 1
  w: 4
  h: 4
  config:
    provider: open-meteo
    cityName: London
    cacheTtl: 900
```
