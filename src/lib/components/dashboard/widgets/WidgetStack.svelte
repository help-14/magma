<script>
  // @ts-nocheck
  import { Trash2 } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
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

  let flow = $derived(
    widget.config?.flow ||
      (widget.type === 'stack-vertical' ? 'vertical' : 'horizontal')
  )
  let cols = $derived(widget.config?.cols ?? 2)
  let rows = $derived(widget.config?.rows ?? 0)
  let gap = $derived(widget.config?.gap ?? 12)

  let gridStyle = $derived.by(() => {
    if (flow === 'horizontal' && rows > 0) {
      return `display: grid; grid-template-rows: repeat(${rows}, auto); grid-auto-flow: column; gap: ${gap}px;`
    }
    return `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px;`
  })
</script>

<div class="flex flex-col p-3 w-full min-w-0 min-h-0">
  <div class="text-magma-accent text-sm font-extrabold mb-2">
    {widget.title}
  </div>
  <div
    class="flex-1 min-h-0"
    role="list"
    aria-label={`${widget.title} children`}
    ondrop={onDropChild}
    ondragover={onDragOverChild}
    style={gridStyle}
  >
    {#each widget.children || [] as child (child.id)}
      <div
        class:selected={selectedChildId === child.id}
        class={'relative min-w-0 min-h-0 overflow-hidden rounded-lg bg-white/6' +
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
          <Button
            variant="ghost"
            size="icon"
            disabled={false}
            class={`absolute top-1.5 right-1.5 z-5 size-7 border border-white/18 rounded-lg bg-[rgb(80_24_18/88%)] text-[#ffe1d8] cursor-pointer transition-all duration-100 hover:bg-[rgb(130_36_28/94%)] active:scale-96 focus-visible:opacity-100 ${editMode ? 'opacity-100' : 'opacity-0'}`}
            aria-label={m.widget_delete()}
            title={m.widget_delete()}
            onclick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onDeleteChild(event, child)
            }}
          >
            <Trash2 size={13} />
          </Button>
        {/if}
      </div>
    {/each}
  </div>
</div>
