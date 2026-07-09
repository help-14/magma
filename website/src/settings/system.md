---
layout: layouts/doc.njk
title: System Settings
description: Configure config/system.yaml.
---

# System Settings

`config/system.yaml` stores app-level settings that are not tied to a specific widget.

## Dashboard grid

The dashboard grid uses fixed pixel cells. Widget dimensions are stored as grid units, so changing cell size changes the rendered size of every widget.

```yaml
dashboardGrid:
  cellWidth: 100
  cellHeight: 100
```

## Background image

The dashboard uses a blurred background image behind warm translucent panels.

```yaml
backgroundImage: /bg.jpg
```

## Language

Magma ships with English and Vietnamese translations.

```yaml
language: en
```
