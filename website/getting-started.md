---
description: Install, run, configure, and deploy Magma.
---

# Getting Started

Magma is a SvelteKit dashboard app with Docker support and a file-backed configuration model. Use it locally for development or run it as a self-hosted dashboard service.

## Requirements

- Node.js 26 or newer
- pnpm
- Docker and Docker Compose for container deployment

## Install dependencies

```sh
pnpm install
```

## Run in development

```sh
pnpm dev
```

The development server starts at `http://localhost:5173`.

## Build and preview

```sh
pnpm build
pnpm preview
```

## Run with Docker

```sh
docker compose up -d
```

The app listens on port `3000`. The `config/` directory is mounted into the container and stores system settings, dashboard layout, widget configuration, and CSS overrides.

## First dashboard edit

1. Open the dashboard.
2. Press the edit button in the bottom-right corner.
3. Press Add Widget to open the floating palette.
4. Drag a widget onto the grid.
5. Select the widget to edit its properties.
6. Press Done to save the layout.

## Build this website

This website is generated from markdown in `website/` with VitePress.

```sh
pnpm website:build
```

The static output is written to `website/.vitepress/dist`.
```
