---
title: Stack Widget
description: Configure Magma stack widgets.
---

# Stack Widget

The Stack widget groups Button widgets into a compact panel. Use it for app launchers, bookmarks, service links, or workflow shortcuts.

## Best size

Default palette size: `3 x 4`. Increase width for horizontal stacks or height for vertical stacks.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `flow` | select | Vertical or horizontal child layout. |
| `cols` | number | Number of columns. |
| `rows` | number | Number of rows, or `0` for automatic behavior. |
| `gap` | number | Gap between child buttons. |

## YAML example

```yaml
- id: launchers
  type: stack
  title: Launchers
  x: -4
  y: 5
  w: 4
  h: 3
  config:
    flow: horizontal
    cols: 2
    rows: 0
    gap: 12
  children:
    - id: docs
      type: button
      title: Docs
      config:
        urls: https://example.com/docs
        icon: lucide:book-open
```
