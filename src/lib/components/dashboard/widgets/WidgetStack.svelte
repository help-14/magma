<script lang="ts">
  import { flip } from 'svelte/animate'
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
    onReorderChild = () => {}
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

  let children = $derived(widget.children || [])

  let listRef = $state<HTMLElement | null>(null)
  let dragChildId = $state<string | null>(null)
  let dragOverIndex = $state<number | null>(null)

  let displayChildren = $derived.by<any[]>(() => {
    if (!dragChildId || dragOverIndex === null) return children as any[]
    const filtered = children.filter((c) => c.id !== dragChildId)
    const fromIndex = children.findIndex((c) => c.id === dragChildId)
    const adjustedIndex = Math.min(
      dragOverIndex > fromIndex ? dragOverIndex - 1 : dragOverIndex,
      filtered.length
    )
    const result: any[] = [...filtered]
    result.splice(adjustedIndex, 0, { id: `__shadow_${dragChildId}`, _shadow: true })
    return result
  })

  function onPointerDown(event: PointerEvent, child: any) {
    if (!editMode || !listRef) return
    event.preventDefault()
    event.stopPropagation()
    dragChildId = child.id
    dragOverIndex = null
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragChildId || !listRef) return
    const items = Array.from(listRef.children) as HTMLElement[]
    const isHorizontal = flow === 'horizontal'

    let found = items.length
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect()
      const mid = isHorizontal ? r.left + r.width / 2 : r.top + r.height / 2
      const pos = isHorizontal ? event.clientX : event.clientY
      if (pos < mid) {
        found = i
        break
      }
    }
    dragOverIndex = found
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)

    if (dragChildId && dragOverIndex !== null) {
      onReorderChild(widget.id, dragChildId, dragOverIndex)
    }
    dragChildId = null
    dragOverIndex = null
  }
</script>

<div class="flex flex-col p-5 w-full min-w-0 min-h-0">
  <div class="text-accent text-sm font-extrabold mb-2">
    {widget.title}
  </div>
  <div
    bind:this={listRef}
    class="flex-1 min-h-0 stack-grid"
    role="list"
    aria-label={`${widget.title} children`}
    style={gridStyle}
  >
    {#each displayChildren as child, i (child.id)}
      <div animate:flip={{ duration: 200 }}>
        {#if '_shadow' in child}
          <div
            class="relative min-w-0 h-full overflow-hidden rounded-lg bg-white/6 border-2 border-dashed border-yellow-400/50"
            role="listitem"
            aria-label="Drop position"
          ></div>
        {:else}
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
            onPointerDown={onPointerDown}
          >
            <WidgetRenderer widget={child} {locations} compact {editMode} />
          </WidgetStackChildFrame>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
</style>