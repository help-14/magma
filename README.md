# Magma

A customizable SvelteKit dashboard app with a grid-based widget editor, multi-language support, and Docker deployment.

<a href="https://ibb.co/gL2p9z9T"><img src="https://i.ibb.co/ZpjPXWX8/Screenshot-2026-06-26-at-22-35-36.png" alt="Screenshot-2026-06-26-at-22-35-36" border="0" /></a>

<a href="https://ibb.co/bM6hdxZ9"><img src="https://i.ibb.co/PvrpCRnH/Screenshot-2026-06-26-at-22-35-52.png" alt="Screenshot-2026-06-26-at-22-35-52" border="0" /></a>

## Features

- **Grid Dashboard Editor** — Drag, resize, and arrange widgets on an unbounded centered grid with cell-size snapping. Edit mode toggles drag bars, resize handles, and a floating widget palette.
- **Widget System** — Built-in widgets include:
  - **Button** — Link launcher with icon picker
  - **Search** — Search bar with configurable provider
  - **Timer** — Countdown / stopwatch timer
  - **Weather** — Live weather display with location presets
  - **Calendar** — Date and events view
  - **Stack (horizontal / vertical)** — Group child widgets into rows or columns
  - **Docker Status** — Monitor container states
  - **Service Status** — HTTP endpoint health checks
  - **Fetch** — Display content from any URL
  - **DeepSeek** — Account balance and token usage monitor
- **Settings Panel** — Three configuration sections:
  - **System** — Grid dimensions (cell width/height), background image, language
  - **Dashboard** — Widget layout, search, network, theme, and integration references
  - **CSS** — Custom CSS overrides loaded after built-in styles
- **Internationalization** — i18n via [inlang](https://inlang.com) / [Paraglide JS](https://paraglidejs.com). Ships with English and Vietnamese.
- **Remote Functions** — Server-side data fetching for widgets via SvelteKit remote functions.
- **Dark Theme** — Warm dark translucent panels with yellow accent. Powered by [shadcn-svelte](https://shadcn-svelte.com) components and [Tailwind CSS 4](https://tailwindcss.com).
- **Docker Support** — Multi-stage Docker build and `docker-compose.yml` for production deployment.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 26
- [pnpm](https://pnpm.io/installation)

### Install

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

The dev server starts at `http://localhost:5173`.

### Build & Preview

```sh
pnpm build
pnpm preview
```

### Type Checking

```sh
pnpm check
```

## Configuration

All configuration lives in the `config/` directory at the project root. In Docker deployments this directory is mounted as a volume.

| File                    | Purpose                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| `config/system.yaml`    | App-level settings (grid dimensions, background image, language)           |
| `config/dashboard.yaml` | Widget layout, theme, search providers, network and integration references |
| `config/override.css`   | Custom CSS overrides (loaded after built-in styles)                        |

Environment variables referenced in YAML (e.g., for API tokens) are resolved at runtime. Secrets should **never** be committed to YAML files directly.

## Docker

```sh
docker compose up -d
```

The app listens on port `3000`. Configuration files in `config/` are automatically mounted into the container at `/config`.

Environment variables for production:

| Variable     | Default                 | Description                           |
| ------------ | ----------------------- | ------------------------------------- |
| `NODE_ENV`   | `production`            | Runtime environment                   |
| `HOST`       | `0.0.0.0`               | Server bind address                   |
| `PORT`       | `3000`                  | Server port                           |
| `ORIGIN`     | `http://localhost:3000` | Public URL (used for CSRF protection) |
| `CONFIG_DIR` | `/config`               | Path to configuration directory       |

## Project Structure

```
magma/
├── config/                  # Runtime configuration (YAML + CSS)
│   ├── dashboard.yaml
│   ├── system.yaml
│   └── override.css
├── docs/                    # Design specs and planning
├── messages/                # i18n translation files
│   ├── en.json
│   └── vi.json
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── dashboard/   # Dashboard editor, widget palette, property panels
│   │   │   ├── settings/    # Settings panel
│   │   │   └── ui/          # shadcn-svelte UI primitives
│   │   ├── hooks/           # Svelte reusable logic
│   │   ├── paraglide/       # Auto-generated i18n (via inlang)
│   │   ├── remotes/         # Server remote functions
│   │   ├── server/          # Server-only code (config I/O, etc.)
│   │   └── types/           # JSDoc type definitions
│   ├── routes/              # SvelteKit pages and API endpoints
│   │   ├── (dashboard)/     # Main dashboard page + editor
│   │   ├── api/             # REST API endpoints
│   │   └── settings/        # Settings page
│   └── app.html             # HTML shell
├── static/                  # Static assets
├── build/                   # Production build output
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Dashboard Editor

- The grid canvas spans the full viewport and is **centered horizontally** (x=0 at page center).
- Widget positions use a **centered coordinate system** — negative x is left of center, positive x is right.
- The grid is **unbounded** — no fixed column or row limits. Only overlap is enforced.
- **Cell size** is configurable in Settings → System (`cellWidth` / `cellHeight`, default 100×100 px).
- In **edit mode**, grid lines are shown at cell-size intervals with a highlighted yellow center line.
- Widgets are moved by dragging their top drag bar; resize handles appear on hover in edit mode.
- **Add Widget** opens a floating bottom palette. Dropping a widget scans ±20 cells from the drop point for the nearest free position.
- Changes are not autosaved — press **Done** to persist the layout.

## Widgets

Widgets are defined in `config/dashboard.yaml` under `dashboard.widgets`. Each widget has:

```yaml
- id: my-widget
  type: button # One of the supported widget types
  title: My Widget
  x: 0 # Grid X position (centered)
  y: 0 # Grid Y position
  w: 4 # Width in cells
  h: 2 # Height in cells
  config: {} # Type-specific configuration
```

Stacks can contain child widgets:

```yaml
- id: my-stack
  type: stack-horizontal
  title: Launchers
  x: -5
  y: 2
  w: 10
  h: 2
  config:
    gap: 12
  children:
    - id: app-1
      type: button
      title: App 1
      config:
        icon: lucide:globe
        url: https://example.com
```

## Remote Functions

Server-side data fetching is implemented via SvelteKit remote functions in `src/lib/remotes/*.remote.js`. These provide a type-safe RPC layer for widgets that need live data (weather, Docker status, DeepSeek balance, etc.).

## License

MIT
