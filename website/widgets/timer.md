---
title: Timer Widget
description: Configure Magma timer and clock widgets.
---

# Timer Widget

The Timer widget displays time, date, and greeting information. It can be tuned for compact clock displays or larger dashboard headers.

## Best size

Default palette size: `10 x 4`. Use a wide layout when it acts as the visual anchor for the dashboard.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `showSeconds` | checkbox | Show seconds in the time display. |
| `showDate` | checkbox | Show the current date. |
| `showGreeting` | checkbox | Show the greeting line. |
| `hour12` | checkbox | Use 12-hour time. |
| `timezone` | text | Optional IANA timezone such as `America/New_York`. |

## YAML example

```yaml
- id: clock
  type: timer
  title: Clock
  x: -5
  y: 1
  w: 10
  h: 4
  config:
    showSeconds: false
    showDate: true
    showGreeting: true
    hour12: false
    timezone: Asia/Ho_Chi_Minh
```
