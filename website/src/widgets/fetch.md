---
layout: layouts/doc.njk
title: Fetch Widget
description: Configure Magma Fetch widgets.
---

# Fetch Widget

The Fetch widget requests arbitrary HTTP content and formats the response for display.

## Best size

Default palette size: `8 x 8`. Use it for content-heavy responses, status summaries, or formatted API output.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `url` | text | Request URL. |
| `method` | select | GET, POST, PUT, or DELETE. |
| `headers` | textarea | JSON array of headers. |
| `body` | textarea | Request body for non-GET methods. |
| `formatScript` | textarea | Script that converts `responseText` into display text. |
| `refreshInterval` | number | Refresh interval in seconds. |

## YAML example

```yaml
- id: service-info
  type: fetch
  title: Service Info
  x: -4
  y: 8
  w: 8
  h: 8
  config:
    url: https://status.example.com/api
    method: GET
    headers: '[]'
    formatScript: return responseText
    refreshInterval: 600
```
