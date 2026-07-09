---
layout: layouts/doc.njk
title: Widgets
description: Details for every Magma dashboard widget.
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

## Widget catalog

{% for widget in widgets %}
### [{{ widget.title }}]({{ ('/widgets/' + widget.slug + '/') | url }})

{{ widget.summary }}

- Default palette size: `{{ widget.size }}`
- Config fields: `{{ widget.configFields | join('`, `') }}`
{% endfor %}
