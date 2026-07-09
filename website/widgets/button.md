---
title: Button Widget
description: Configure Magma button launcher widgets.
---

# Button Widget

The Button widget launches one or more URLs. It is also the primary child widget for Stack widgets, where it becomes a compact launcher tile.

## Best size

Default palette size: `4 x 2`. Inside stacks it renders compactly and does not need grid dimensions.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `urls` | textarea | One URL per line. |
| `openIn` | select | Open in current tab, new tab, or new window. |
| `icon` | icon-picker | Icon shown on the button. |
| `iconColor` | color | Icon accent color. |

## YAML example

```yaml
- id: docs-button
  type: button
  title: Docs
  x: 0
  y: 1
  w: 4
  h: 2
  config:
    urls: https://example.com/docs
    openIn: _blank
    icon: lucide:book-open
    iconColor: '#fabd2f'
```
