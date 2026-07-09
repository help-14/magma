---
hero:
  name: Magma
  text: Build a dashboard that feels like your control room.
  tagline: Magma gives you a warm, customizable grid for launchers, services, feeds, weather, markets, repositories, and embedded tools.
  image:
    src: /magma-preview.svg
    alt: Magma dashboard preview
  actions:
    - theme: brand
      text: Start building
      link: /getting-started
    - theme: alt
      text: Explore widgets
      link: /widgets
features:
  - title: Grid editor
    details: Drag and resize widgets on a centered coordinate grid with configurable cell width and height.
  - title: Widgets
    details: Mix API-backed widgets, RSS feeds, Docker status, GitHub repository stats, search, website embeds, and shortcut stacks.
  - title: Settings
    details: Store durable configuration in system, dashboard, and CSS override files while editing layout from the dashboard.
  - title: Deploy
    details: Run Magma with Docker Compose and mount configuration as a volume for self-hosted dashboards.
---

## Why Magma

Magma is built for dashboards that live on a personal monitor, home server, office screen, or browser start page. It keeps layout control close to the user: move widgets where they make sense, group launchers into stacks, and keep operational signals visible without a SaaS account.

The app uses a warm dark visual language with translucent panels and a yellow accent. It is compact enough for dense dashboards, but each widget can grow into a richer panel when it has more grid space.

## What makes it different

- The dashboard grid is centered instead of fixed to a left column.
- Widgets are resized in configured cell units, not arbitrary pixels.
- Configuration is plain YAML and CSS, so it is easy to back up and version.
- Secrets stay in environment variables; YAML references the variable names instead of storing credentials.
- The editor saves only when you press Done, so layout experiments are reversible before commit.