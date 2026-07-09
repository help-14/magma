---
description: Details for every Magma dashboard widget.
features:
  - title: Button
    details: Launch one or more URLs from a compact icon button, including stack-friendly shortcuts. 4 x 2 — urls, openIn, icon, iconColor
  - title: Search
    details: Search the web from your dashboard with configurable providers. 4 x 2 — placeholder, provider
  - title: Timer
    details: Show time, date, greeting, timezone, and display preferences. 10 x 4 — showSeconds, showDate, showGreeting, hour12, timezone
  - title: Weather
    details: Show live weather from Open-Meteo, WeatherAPI.com, or OpenWeatherMap. 4 x 4 — provider, apiKey, cityName, latitude, longitude, cacheTtl
  - title: Calendar
    details: Keep the current date and calendar context visible in your dashboard. 4 x 4 — none
  - title: Stack
    details: Group button widgets into compact horizontal or vertical launch panels. 3 x 4 — flow, cols, rows, gap
  - title: Docker Status
    details: Monitor Docker container state from a configured Docker host endpoint. 6 x 4 — dockerHost, hideOffline, columns
  - title: Fetch
    details: Fetch arbitrary HTTP content and format the response for display. 8 x 8 — url, method, headers, body, formatScript, refreshInterval
  - title: Website
    details: Embed an external website or service page directly in a widget frame. 8 x 6 — url
  - title: DeepSeek
    details: Display DeepSeek account balance and token usage information. 3 x 2 — authToken, refreshInterval
  - title: YouTube
    details: Track uploads or livestream status for configured YouTube channels. 4 x 4 — mode, channels, flow, cols, rows, limit
  - title: RSS
    details: Render feed items from one or more RSS sources in list or card layouts. 4 x 4 — feeds, style, limit, collapseAfter, singleLineTitles, preserveOrder, refreshInterval
  - title: Stock
    details: Track equities, ETFs, crypto pairs, and market movement at a glance. 4 x 4 — stocks, sortBy, cacheTime, refreshInterval
  - title: GitHub Repo
    details: Show repository stars, forks, open pull requests, and open issues. 4 x 4 — repo, showStars, showForks, showPrs, showIssues, refreshInterval
---

# Widgets

Widgets are configured under `dashboard.widgets` in `config/dashboard.yaml`. Every widget has an `id`, `type`, `title`, optional grid position, dimensions, and a type-specific `config` object.

```yaml
- id: my-widget
  type: weather
  title: Weather
  x: 0
  y: 1
  w: 4
  h: 4
  config:
    provider: open-meteo
    cityName: London
```

The editor uses the same settings through the property panel. Grid position uses a centered coordinate system: negative `x` values sit left of center and positive values sit right of center.
