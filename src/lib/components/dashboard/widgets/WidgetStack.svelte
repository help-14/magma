<script>
  // @ts-nocheck
  import { Trash2 } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import WidgetRenderer from '../WidgetRenderer.svelte'
  /** @type {import('$lib/types/widget.js').StackWidgetProps} */
  let {
    widget,
    locations = {},
    compact = false,
    editMode = false,
    selectedChildId = null,
    onSelectChild = () => {},
    onDeleteChild = () => {},
    onDropChild = () => {},
    onDragOverChild = () => {}
  } = $props()
</script>

<div class="flex flex-col p-3 w-full min-w-0 min-h-0">
  <div class="text-magma-accent text-sm font-extrabold mb-2">
    {widget.title}
  </div>
  <div
    class="flex flex-1 min-h-0"
    class:flex-col={widget.type === 'stack-vertical'}
    role="list"
    aria-label={`${widget.title} children`}
    ondrop={onDropChild}
    ondragover={onDragOverChild}
    style={`gap: ${widget.config?.gap ?? 12}px;`}
  >
    {#each widget.children || [] as child (child.id)}
      <div
        class:selected={selectedChildId === child.id}
        class={'relative flex-1 min-w-0 min-h-0 overflow-hidden rounded-lg bg-white/6' +
          (selectedChildId === child.id
            ? ' shadow-[0_0_0_2px_var(--magma-accent),0_18px_46px_rgb(0_0_0/26%)]'
            : '')}
        role="listitem"
        onclickcapture={(event) => {
          if (editMode) onSelectChild(event, child)
        }}
      >
        <WidgetRenderer widget={child} {locations} compact {editMode} />
        {#if editMode}
          <button
            class="absolute top-1.5 right-1.5 z-5 grid size-7 place-items-center border border-white/18 rounded-lg bg-[rgb(80_24_18/88%)] text-[#ffe1d8] opacity-0 cursor-pointer transition-all duration-100 hover:bg-[rgb(130_36_28/94%)] active:scale-96 focus-visible:opacity-100"
            class:opacity-100={editMode}
            type="button"
            aria-label={m.widget_delete()}
            title={m.widget_delete()}
            onclick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDeleteChild(event, child)
            }}
          >
            <Trash2 size={13} />
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
