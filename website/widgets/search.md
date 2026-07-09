---
title: Search Widget
description: Configure Magma search widgets.
---

# Search Widget

The Search widget puts a search bar on the dashboard with a configurable provider.

## Best size

Default palette size: `4 x 2`. Give it more width if you want longer query text visible.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `placeholder` | text | Placeholder shown in the input. |
| `provider` | select | Google, DuckDuckGo, Bing, YouTube, or Wikipedia. |

## YAML example

```yaml
- id: web-search
  type: search
  title: Search
  x: -2
  y: 1
  w: 4
  h: 2
  config:
    placeholder: Search the web
    provider: duckduckgo
```
