<script>
  // @ts-nocheck
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import IconPicker from './IconPicker.svelte'
  import { widgetConfigFields } from '$lib/types/widget-config-fields.js'

  /** @type {import('$lib/types/widget.js').PropertyPanelProps} */
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

  /** @type {import('$lib/types/config.js').ConfigFieldDescriptor[]} */
  let fields = $derived(widgetConfigFields[widget.type] || [])
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

  {#each fields as field}
    {#if field.type === 'icon-picker'}
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase"
          >{field.label}</span
        >
        <IconPicker
          value={widget.config?.[field.key] || field.default}
          onSelect={(icon) => onUpdateConfig(field.key, icon)}
        />
      </Label>
    {:else if field.type === 'color'}
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase"
          >{field.label}</span
        >
        <div class="grid grid-cols-[44px_1fr] gap-2">
          <Input
            class="min-w-0 p-1 cursor-pointer"
            type="color"
            value={widget.config?.[field.key] || field.default}
            oninput={(event) =>
              onUpdateConfig(field.key, event.currentTarget.value)}
          />
          <Input
            value={widget.config?.[field.key] || ''}
            placeholder="default or {field.default}"
            oninput={(event) =>
              onUpdateConfig(field.key, event.currentTarget.value)}
          />
        </div>
      </Label>
    {:else if field.type === 'checkbox'}
      <Label class="flex items-center gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={widget.config?.[field.key] ?? field.default}
          onchange={(event) =>
            onUpdateConfig(field.key, event.currentTarget.checked)}
          class="accent-magma-accent"
        />
        <span class="text-magma-muted text-xs font-bold uppercase"
          >{field.label}</span
        >
      </Label>
    {:else if field.type === 'select'}
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase"
          >{field.label}</span
        >
        <select
          class="flex h-9 w-full rounded-md border border-magma-line bg-magma-panel px-3 py-1 text-sm text-magma-text shadow-sm cursor-pointer outline-0"
          value={widget.config?.[field.key] ?? field.default}
          onchange={(event) =>
            onUpdateConfig(field.key, event.currentTarget.value)}
        >
          {#each field.options || [] as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </Label>
    {:else}
      <Label class="grid gap-1.5 mt-3">
        <span class="text-magma-muted text-xs font-bold uppercase"
          >{field.label}</span
        >
        <Input
          type={field.type === 'number' ? 'number' : 'text'}
          min={field.type === 'number' ? '0' : undefined}
          value={widget.config?.[field.key] ?? field.default}
          placeholder={field.placeholder}
          oninput={(event) => {
            const val =
              field.type === 'number'
                ? Number(event.currentTarget.value)
                : event.currentTarget.value
            onUpdateConfig(field.key, val)
          }}
        />
      </Label>
    {/if}
  {/each}
</aside>
