---
description: Understand Magma configuration files.
---

# Settings

Magma stores durable configuration in the `config/` directory. In Docker deployments this directory is mounted as a volume so your settings survive container updates.

| File | Purpose |
| --- | --- |
| `config/system.yaml` | App-level settings such as background image, language, and dashboard grid cell size. |
| `config/dashboard.yaml` | Widgets, locations, search, network, theme, and integration references. |
| `config/override.css` | Custom CSS loaded after built-in styles. |

Secrets should not be committed to YAML. Store credential values in environment variables and reference the variable names in config.

## Edit paths

- Use the dashboard editor for widget placement and property changes.
- Use Settings for system settings, dashboard YAML, and CSS override editing.
- Edit files directly when you want version control or bulk changes.
