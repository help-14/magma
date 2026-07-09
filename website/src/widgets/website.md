---
layout: layouts/doc.njk
title: Website Widget
description: Configure Magma Website widgets.
---

# Website Widget

The Website widget embeds a URL inside a dashboard frame. It works best for internal tools or pages that allow embedding.

## Best size

Default palette size: `8 x 6`.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `url` | text | URL to embed. |

## YAML example

```yaml
- id: internal-status
  type: website
  title: Status Page
  x: 0
  y: 10
  w: 8
  h: 6
  config:
    url: https://status.example.com
```
