---
layout: layouts/doc.njk
title: Stock Widget
description: Configure Magma Stock widgets.
---

# Stock Widget

The Stock widget tracks symbols such as equities, ETFs, and crypto pairs.

## Best size

Default palette size: `4 x 4`.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `stocks` | textarea | One symbol per line, optionally with a label. |
| `sortBy` | select | Default input order, change percentage, or absolute change percentage. |
| `cacheTime` | number | Cache time in seconds. |
| `refreshInterval` | number | Refresh interval in seconds. |

## YAML example

```yaml
- id: markets
  type: stock
  title: Markets
  x: -4
  y: 5
  w: 4
  h: 4
  config:
    stocks: |
      SPY: S&P 500
      AAPL: Apple
      NVDA
      BTC-USD: Bitcoin
    sortBy: change
    cacheTime: 300
    refreshInterval: 300
```
