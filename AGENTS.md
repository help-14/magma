# Magma Agent Notes

## Project

Magma is a SvelteKit dashboard app migrated from the legacy Cloudflare/SolidJS Magma app.

- App root: `/Users/nhan/Documents/magma`
- Package manager: `pnpm`
- Framework: SvelteKit with Svelte 5 runes
- Styling: Tailwind 4, local shadcn-svelte components, Geist, lucide icons

## UI Rules

- Using latest tailwinds css and shadcn-svelte components and fuatures.
- Use installed shadcn-svelte components from `$lib/components/ui/*` instead of custom one. If a component you need does not exist locally yet then install that component from shadcn-svelte.
- Do not use arbitrary `-[]` values in Tailwind classes (e.g. `min-w-[130px]`, `rounded-[8px]`, `p-[18px]`, `duration-[120ms]`, `text-[#211b12]`). Use standard Tailwind size, time, and color classes instead. Only use `-[]` when there is no standard Tailwind class to achieve the same result.
- Do not import UI primitives directly from the `shadcn-svelte` package in app code.
- Keep the dashboard and settings pages visually aligned: blurred background image, warm dark translucent panels, yellow accent, and compact controls.
- Keep cards/panels shallow. Do not nest decorative cards inside other cards.
- Settings uses three sections:
  - System settings: `config/system.yaml`
  - Dashboard settings: `config/dashboard.yaml`
  - CSS override: `config/override.css`

## Server Calls

- Prefer SvelteKit remote functions for app server calls.
- Remote functions live in `src/lib/remotes/*.remote.js`.
- Keep legacy REST routes only when useful for compatibility or direct endpoint checks.
- Server-owned files are read/written through `src/lib/server/config.js`.

## Config Files

- `config/system.yaml` stores app-level settings such as background image, `cellWidth`, and `cellHeight`.
- `config/dashboard.yaml` stores widgets, locations, search, network, theme, and integration references.
- `config/override.css` stores custom CSS. Do not put CSS override text in YAML.
- Keep secrets out of YAML; store credential values in environment variables and reference env var names.
- Validate YAML-derived config before saving.

## Dashboard Editor

- The grid canvas spans the full viewport width and is centered horizontally (x=0 at page center).
- Widget positions use a centered coordinate system: negative x = left of center, positive x = right of center.
- The grid is unbounded — no fixed column/row limits. Widgets can be placed anywhere and only overlap is enforced.
- Cell sizes are fixed pixels (`cellWidth` × `cellHeight`), configured in `config/system.yaml` under `dashboardGrid`.
  Default: `cellWidth: 100, cellHeight: 100`. Adjustable in Settings → System settings sidebar.
- The grid background (edit mode) shows repeating vertical/horizontal lines at `cellSize` intervals, with a highlighted yellow center line at x=0.
- Grid lines show in edit mode. Drag bars and resize handles show in edit mode.
- Widgets only move by dragging the top drag bar.
- Add Widget opens a floating bottom palette, not a modal drawer/backdrop. Dropping a widget scans ±20 cells from the drop point to find the nearest free position.
- Do not autosave after drag/drop/resize. Save only when pressing Done to exit edit mode.
- In edit mode, clicking a widget or stack child opens the property panel instead of navigating.

## Verification

Run these before handing off meaningful changes:

```sh
pnpm check
pnpm build
```

Known warnings may exist for intentionally stateful initial props or dashboard click handling, but do not leave new errors.
