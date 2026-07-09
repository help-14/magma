---
title: DeepSeek Widget
description: Configure Magma DeepSeek widgets.
---

# DeepSeek Widget

The DeepSeek widget displays account balance and token usage information.

## Best size

Default palette size: `3 x 2`.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `authToken` | password | DeepSeek authentication token. Store secrets in environment variables when possible. |
| `refreshInterval` | number | Refresh interval in seconds. |

## YAML example

```yaml
- id: deepseek
  type: deepseek
  title: DeepSeek
  x: 3
  y: 1
  w: 3
  h: 2
  config:
    authToken: DEEPSEEK_AUTH_TOKEN
    refreshInterval: 600
```
