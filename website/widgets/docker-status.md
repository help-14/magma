---
title: Docker Status Widget
description: Configure Magma Docker status widgets.
---

# Docker Status Widget

The Docker Status widget monitors container state from a Docker host endpoint.

## Best size

Default palette size: `6 x 4`. Increase height if you monitor many containers.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `dockerHost` | text | Docker API URL, such as `http://10.0.0.1:2375`. |
| `hideOffline` | checkbox | Hide stopped or unavailable containers. |
| `columns` | number | Number of display columns. |

## YAML example

```yaml
- id: docker
  type: docker-status
  title: Docker
  x: 0
  y: 5
  w: 6
  h: 4
  config:
    dockerHost: http://10.0.0.1:2375
    hideOffline: true
    columns: 2
```
