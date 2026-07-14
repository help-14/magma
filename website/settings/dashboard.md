---
description: Configure config/dashboard.yaml.
---

# Dashboard Settings

`config/dashboard.yaml` stores the dashboard layout and widget configuration.

## Widgets

Each widget has an ID, type, title, grid position, size, and config object.

```yaml
dashboard:
  widgets:
    - id: weather
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

## Locations

Locations can store named latitude and longitude pairs used by widgets.

```yaml
locations:
  home:
    latitude: 51.5072
    longitude: -0.1276
```

## Theme

Theme settings control dashboard accent color and background image reference.

```yaml
theme:
  backgroundImage: /bg.jpg
```

## Integrations

Integration settings should reference environment variable names for secrets instead of storing raw credential values.
