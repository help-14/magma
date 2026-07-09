---
layout: layouts/doc.njk
title: RSS Widget
description: Configure Magma RSS widgets.
---

# RSS Widget

The RSS widget renders feed items from one or more sources.

## Best size

Default palette size: `4 x 4`. Use a larger widget for detailed lists or many articles.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `feeds` | textarea | JSON array of feed definitions. |
| `style` | select | Vertical list, detailed list, or horizontal cards. |
| `limit` | number | Maximum articles. |
| `collapseAfter` | number | Collapse the list after this many items. |
| `singleLineTitles` | checkbox | Keep article titles on one line. |
| `preserveOrder` | checkbox | Keep feed order instead of sorting. |
| `refreshInterval` | number | Refresh interval in seconds. |

## YAML example

```yaml
- id: hacker-news
  type: rss
  title: RSS
  x: 4
  y: 5
  w: 4
  h: 4
  config:
    feeds: '[{"url":"https://hnrss.org/frontpage","title":"HN"}]'
    style: vertical-list
    limit: 25
    collapseAfter: 5
    singleLineTitles: false
    preserveOrder: false
    refreshInterval: 600
```
