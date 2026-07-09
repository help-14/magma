---
layout: layouts/doc.njk
title: GitHub Repo Widget
description: Configure Magma GitHub repository widgets.
---

# GitHub Repo Widget

The GitHub Repo widget displays repository activity and summary metrics.

## Best size

Default palette size: `4 x 4`.

## Settings

| Field | Type | Purpose |
| --- | --- | --- |
| `repo` | text | Repository in `owner/repo` format. |
| `showStars` | checkbox | Show star count. |
| `showForks` | checkbox | Show fork count. |
| `showPrs` | checkbox | Show open pull requests. |
| `showIssues` | checkbox | Show open issues. |
| `refreshInterval` | number | Refresh interval in seconds. |

## YAML example

```yaml
- id: magma-repo
  type: github-repo
  title: Magma Repo
  x: 4
  y: 1
  w: 4
  h: 4
  config:
    repo: help-14/magma
    showStars: true
    showForks: true
    showPrs: true
    showIssues: true
    refreshInterval: 3600
```
