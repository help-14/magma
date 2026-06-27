# Magma Agent Notes

## Project

Magma is a SvelteKit dashboard app migrated from the legacy Cloudflare/SolidJS Magma app.

- Package manager: `pnpm`
- Framework: SvelteKit with Svelte 5 runes
- Styling: Tailwind 4, local shadcn-svelte components, Geist, lucide icons

## UI Rules

- Using latest tailwinds css and shadcn-svelte components and fuatures.
- Use installed shadcn-svelte components from `$lib/components/ui/*` instead of custom one. If a component you need does not exist locally yet then install that component from shadcn-svelte. Example don't use native button.
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

## Creating a Widget

A widget requires changes in **6 files** spread across types, remote, component, and registration:

### 1. `src/lib/types/config.js` — Config typedef

Add a `@typedef` for the widget's config object with all configurable properties:

```js
/**
 * @typedef {Object} MyWidgetConfig
 * @property {string} [apiKey]
 * @property {number} [refreshInterval]
 */
```

### 2. `src/lib/types/widget.js` — Widget type & props typedef

Add the widget name to the `WidgetType` union and create a props typedef:

```js
// Add to the WidgetType union:
@typedef {'...'|'my-widget'} WidgetType

// Add props typedef:
/**
 * @typedef {Object} MyWidgetWidgetProps
 * @property {Omit<Widget, 'config'> & { config?: MyWidgetConfig }} widget
 * @property {boolean} [compact]
 */
```

### 3. `src/lib/types/widget-config-fields.js` — Property panel fields

Add a `widgetConfigFields` entry so the property panel renders correctly:

```js
'my-widget': [
  { key: 'apiKey', label: 'API Key', type: 'text', default: '' },
  { key: 'refreshInterval', label: 'Refresh (s)', type: 'number', default: 300 }
]
```

Supported field types: `text`, `number`, `color`, `icon-picker`, `checkbox`, `select`, `textarea`, `password`.

### 4. `src/lib/remotes/*.remote.js` — Server remote

Create a remote function using SvelteKit's `query` with valibot validation. Add an in-memory cache if calling an external API:

```js
// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const cache = new Map();
const CACHE_TTL = 60_000;

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

export const fetchMyData = query(
  v.object({ param: v.string() }),
  async ({ param }) => {
    const cached = getCached(param);
    if (cached) return cached;
    const response = await fetch(`https://api.example.com/${param}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    setCache(param, data);
    return data;
  }
);
```

Cache GET requests only — skip caching for POST/PUT/DELETE. Do NOT cache `docker.remote.js` (local API).

### 5. `src/lib/components/dashboard/widgets/Widget*.svelte` — Widget component

Place the Svelte 5 component in this directory. Use `$props`, `$state`, `$derived`, and `$effect` (not `onMount` — `$effect` re-fetches when config changes):

```svelte
<script>
  import { RefreshCw } from '@lucide/svelte'
  import { fetchMyData } from '$lib/remotes/my-widget.remote.js'
  import { Button } from '$lib/components/ui/button/index.js'

  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let data = $state([])

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 300)
  let hasConfig = $derived((widget.config?.apiKey || '').trim().length > 0)

  async function doFetch() {
    if (!hasConfig) return
    state = 'loading'
    errorMsg = ''
    try {
      const result = await fetchMyData({ param: widget.config?.apiKey || '' })
      data = result
      state = 'content'
    } catch (err) {
      state = 'error'
      errorMsg = err.message || String(err)
    }
  }

  $effect(() => {
    if (!hasConfig) {
      state = 'idle'
      data = []
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden">
  <div class="flex items-center gap-2 text-magma-accent text-sm font-extrabold px-3 p-2 pb-1 shrink-0">
    <span class="truncate">{widget.title}</span>
  </div>

  {#if state === 'idle'}
    <div class="flex items-center justify-center h-full text-magma-muted text-xs p-4">
      Configure in properties
    </div>
  {:else if state === 'loading'}
    <div class="flex items-center justify-center h-full">
      <RefreshCw class="animate-spin text-magma-muted" size={24} />
    </div>
  {:else if state === 'error'}
    <div class="flex items-center justify-center h-full text-red-400 text-xs p-4 text-center">
      {errorMsg}
    </div>
  {:else if state === 'content'}
    <div class="flex-1 overflow-y-auto min-h-0 px-1 pb-1">
      ...
    </div>
  {/if}

  <Button onclick={doFetch} variant="ghost"
    class="absolute top-1 right-1 p-1 rounded text-sm aspect-square" title="Refresh">
    <RefreshCw class="size-3" />
  </Button>
</div>
```

### 6. Registration — three places to register

**a. `src/lib/components/dashboard/WidgetRenderer.svelte`** — Add import and map entry:

```js
import WidgetMyWidget from './widgets/WidgetMyWidget.svelte'
// in the map object:
'my-widget': WidgetMyWidget,
```

**b. `src/lib/server/config.js`** — Add to `knownWidgetTypes` set:

```js
const knownWidgetTypes = new Set([
  // ...
  'my-widget'
])
```

**c. `src/routes/(dashboard)/DashboardEditor.svelte`** — Add a template for the Add Widget palette:

```js
const templates = [
  // ...
  { type: 'my-widget', title: 'My Widget', w: 4, h: 4, config: { ... } },
]
```

### 7. `config/dashboard.yaml` — Optional sample entry

Add a widget entry to verify it renders:

```yaml
- id: my-widget-1
  type: my-widget
  title: My Widget
  x: 0
  y: 3
  w: 4
  h: 4
  config:
    apiKey: ''
    refreshInterval: 300
```

## Verification

Run these before handing off meaningful changes:

```sh
pnpm check
pnpm build
```

Known warnings may exist for intentionally stateful initial props or dashboard click handling, but do not leave new errors.
