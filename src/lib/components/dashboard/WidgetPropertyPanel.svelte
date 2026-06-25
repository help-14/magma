<script>
  // @ts-nocheck
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import IconPicker from './IconPicker.svelte'

  /**
   * @typedef {Object} Grid
   * @property {number} columns
   * @property {number} rows
   */

  /**
   * @typedef {Object} Selection
   * @property {string} id
   * @property {string} [childId]
   */

  /**
   * @typedef {Object} ButtonConfig
   * @property {string} [url]
   * @property {string} [icon]
   * @property {string} [iconColor]
   */

  /**
   * @typedef {Object} SearchConfig
   * @property {string} [placeholder]
   * @property {string} [provider]
   */

  /**
   * @typedef {Object} WeatherConfig
   * @property {string} [locationRef]
   */

  /**
   * @typedef {Object} DockerStatusConfig
   * @property {string} [dockerHost]
   * @property {boolean} [hideOffline]
   */

  /**
   * @typedef {Object} StackConfig
   * @property {number} [gap]
   */

  /**
   * @typedef {ButtonConfig|SearchConfig|WeatherConfig|DockerStatusConfig|StackConfig|Object} WidgetConfig
   */

  /**
   * @typedef {Object} Widget
   * @property {string} id
   * @property {'button'|'search'|'timer'|'weather'|'calendar'|'stack-horizontal'|'stack-vertical'|'docker-status'|'service-status'} type
   * @property {string} title
   * @property {number} [x]
   * @property {number} [y]
   * @property {number} [w]
   * @property {number} [h]
   * @property {WidgetConfig} [config]
   * @property {Widget[]} [children]
   */

  /**
   * @typedef {Object} PropertyPanelProps
   * @property {Grid} grid
   * @property {number} gridRows
   * @property {Selection|null} selected
   * @property {Widget} widget
   * @property {() => void} [onClose]
   * @property {(patch: Partial<Widget>) => void} [onUpdate]
   * @property {(key: string, value: string|boolean|number) => void} [onUpdateConfig]
   * @property {(key: string, value: string) => void} [onUpdateNumber]
   */

  /** @type {PropertyPanelProps} */
  let {
    grid,
    gridRows,
    selected,
    widget,
    onClose = () => {},
    onUpdate = () => {},
    onUpdateConfig = () => {},
    onUpdateNumber = () => {}
  } = $props()
</script>

<aside
  class="fixed top-6 bottom-6 left-6 z-23 w-[min(340px,calc(100vw-48px))] p-4 overflow-auto border border-magma-line rounded-lg bg-[rgb(26_22_18/92%)] text-magma-text shadow-[0_30px_90px_rgb(0_0_0/45%)] backdrop-blur-xl max-sm:top-3 max-sm:left-3 max-sm:w-[calc(100vw-24px)] max-sm:bottom-auto max-sm:max-h-[calc(100vh-102px)]"
  aria-label="Widget properties"
>
  <div class="flex items-start justify-between gap-3.5 mb-4">
    <div>
      <p class="text-magma-accent text-xs font-extrabold uppercase m-0 mb-1">
        Properties
      </p>
      <h2 class="m-0 text-lg leading-tight">{widget.title}</h2>
    </div>
    <Button variant="outline" type="button" onclick={onClose}>Close</Button>
  </div>

  <Label class="grid gap-1.5 mt-3">
    <span class="text-magma-muted text-xs font-bold uppercase">Title</span>
    <Input
      value={widget.title}
      oninput={(event) => onUpdate({ title: event.currentTarget.value })}
    />
  </Label>

  <Label class="grid gap-1.5 mt-3">
    <span class="text-magma-muted text-xs font-bold uppercase">ID</span>
    <Input value={widget.id} readonly />
  </Label>

  <Label class="grid gap-1.5 mt-3">
    <span class="text-magma-muted text-xs font-bold uppercase">Type</span>
    <Input value={widget.type} readonly />
  </Label>

  {#if !selected?.childId}
    <div class="grid grid-cols-4 gap-2">
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase">X</span>
        <Input
          type="number"
          min="1"
          max={grid.columns}
          value={widget.x}
          oninput={(event) => onUpdateNumber('x', event.currentTarget.value)}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase">Y</span>
        <Input
          type="number"
          min="1"
          max={gridRows}
          value={widget.y}
          oninput={(event) => onUpdateNumber('y', event.currentTarget.value)}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase">W</span>
        <Input
          type="number"
          min="1"
          max={grid.columns}
          value={widget.w}
          oninput={(event) => onUpdateNumber('w', event.currentTarget.value)}
        />
      </Label>
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase">H</span>
        <Input
          type="number"
          min="1"
          max={gridRows}
          value={widget.h}
          oninput={(event) => onUpdateNumber('h', event.currentTarget.value)}
        />
      </Label>
    </div>
  {/if}

  {#if widget.type === 'button'}
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase">URL</span>
      <Input
        value={widget.config?.url || ''}
        oninput={(event) => onUpdateConfig('url', event.currentTarget.value)}
      />
    </Label>
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase">Icon</span>
      <IconPicker
        value={widget.config?.icon || ''}
        onSelect={(icon) => onUpdateConfig('icon', icon)}
      />
    </Label>
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase"
        >Icon color</span
      >
      <div class="grid grid-cols-[44px_1fr] gap-2">
        <Input
          class="min-w-0 p-1 cursor-pointer"
          type="color"
          value={widget.config?.iconColor || '#fabd2f'}
          oninput={(event) =>
            onUpdateConfig('iconColor', event.currentTarget.value)}
        />
        <Input
          value={widget.config?.iconColor || ''}
          placeholder="default or #fabd2f"
          oninput={(event) =>
            onUpdateConfig('iconColor', event.currentTarget.value)}
        />
      </div>
    </Label>
  {:else if widget.type === 'search'}
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase"
        >Placeholder</span
      >
      <Input
        value={widget.config?.placeholder || ''}
        oninput={(event) =>
          onUpdateConfig('placeholder', event.currentTarget.value)}
      />
    </Label>
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase">Provider</span>
      <Input
        value={widget.config?.provider || 'google'}
        oninput={(event) =>
          onUpdateConfig('provider', event.currentTarget.value)}
      />
    </Label>
  {:else if widget.type === 'weather'}
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase"
        >Location ref</span
      >
      <Input
        value={widget.config?.locationRef || 'default'}
        oninput={(event) =>
          onUpdateConfig('locationRef', event.currentTarget.value)}
      />
    </Label>
  {:else if widget.type === 'docker-status' || widget.type === 'service-status'}
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase"
        >Docker Host URL</span
      >
      <Input
        value={widget.config?.dockerHost || ''}
        placeholder="http://10.0.0.1:2375"
        oninput={(event) =>
          onUpdateConfig('dockerHost', event.currentTarget.value)}
      />
    </Label>
    <Label class="flex items-center gap-2 mt-3 cursor-pointer">
      <input
        type="checkbox"
        checked={widget.config?.hideOffline ?? false}
        onchange={(event) =>
          onUpdateConfig('hideOffline', event.currentTarget.checked)}
        class="accent-magma-accent"
      />
      <span class="text-magma-muted text-xs font-bold uppercase"
        >Hide offline containers</span
      >
    </Label>
  {:else if widget.type === 'stack-horizontal' || widget.type === 'stack-vertical'}
    <Label class="grid gap-1.5 mt-3">
      <span class="text-magma-muted text-xs font-bold uppercase">Gap</span>
      <Input
        type="number"
        min="0"
        value={widget.config?.gap ?? 12}
        oninput={(event) =>
          onUpdateConfig('gap', Number(event.currentTarget.value))}
      />
    </Label>
  {/if}
</aside>
