---
title: YouTube Widget
description: Configure Magma YouTube widgets.
---

# YouTube Widget

The YouTube widget tracks newest uploads or livestream state for configured channels.

## Best size

Default palette size: `4 x 4`.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `mode` | select | Newest uploads or livestream. |
| `channels` | textarea | Channel IDs, one per line. |
| `flow` | select | Vertical or horizontal layout. |
| `cols` | number | Number of columns. |
| `rows` | number | Number of rows, or `0` for automatic behavior. |
| `limit` | number | Maximum videos to display. |

## YAML example

```yaml
- id: youtube
  type: youtube-live
  title: YouTube
  x: 0
  y: 5
  w: 4
  h: 4
  config:
    mode: uploads
    channels: |
      UCXuqSBlHAE6Xw-yeJA0Tunw
    flow: vertical
    cols: 2
    rows: 0
    limit: 10
```
