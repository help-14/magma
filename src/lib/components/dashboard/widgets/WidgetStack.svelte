<script lang="ts">
  import WidgetRenderer from '../WidgetRenderer.svelte'
  import WidgetStackChildFrame from './WidgetStackChildFrame.svelte'
  import { buildStackGridStyle } from './stack-grid-style.js'
  import type { StackWidgetProps } from '$lib/types/widget.js'

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
  }: StackWidgetProps = $props()

  let flow = $derived(
    widget.config?.flow ||
      (widget.type === 'stack-vertical' ? 'vertical' : 'horizontal')
  )
  let cols = $derived(widget.config?.cols ?? 2)
  let rows = $derived(widget.config?.rows ?? 0)
  let gap = $derived(widget.config?.gap ?? 12)

  let gridStyle = $derived.by(() => {
    return buildStackGridStyle({ flow, cols, rows, gap })
  })
</script>

<div class="flex flex-col p-3 w-full min-w-0 min-h-0">
  <div class="text-accent text-sm font-extrabold mb-2">
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
      <WidgetStackChildFrame
        {child}
        {editMode}
        selected={selectedChildId === child.id}
        onSelect={onSelectChild}
        onDelete={(event, target) => {
          event.preventDefault()
          event.stopPropagation()
          onDeleteChild(event, target)
        }}
      >
        <WidgetRenderer widget={child} {locations} compact {editMode} />
      </WidgetStackChildFrame>
    {/each}
  </div>
</div>
