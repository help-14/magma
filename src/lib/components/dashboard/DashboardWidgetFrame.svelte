<script lang="ts">
  import { GripHorizontal, Trash2 } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { Widget } from '$lib/types/widget.js'
  import type { ResizeDirection } from '$lib/dashboard/resize-utils.js'

  let {
    widget,
    editMode = false,
    dragging = false,
    selected = false,
    style = '',
    onSelect = () => {},
    onDragWidget = () => {},
    onDragEnd = () => {},
    onStartMove = () => {},
    onDelete = () => {},
    onStartResize = () => {},
    children
  }: {
    widget: Widget
    editMode?: boolean
    dragging?: boolean
    selected?: boolean
    style?: string
    onSelect?: (event: MouseEvent | KeyboardEvent, widget: Widget) => void
    onDragWidget?: (event: DragEvent, widget: Widget) => void
    onDragEnd?: (event: DragEvent) => void
    onStartMove?: (event: PointerEvent, widget: Widget) => void
    onDelete?: (event: MouseEvent, widget: Widget) => void
    onStartResize?: (
      event: PointerEvent,
      widget: Widget,
      direction: ResizeDirection
    ) => void
    children?: Snippet
  } = $props()
</script>

<div
  class:dragging
  class:selected
  class="absolute p-1.5 animate-in fade-in duration-200"
  draggable={editMode && widget.type === 'button'}
  {style}
  onclick={(event: MouseEvent) => onSelect(event, widget)}
  onkeydown={(event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(event, widget)
    }
  }}
  ondragstart={(event: DragEvent) => onDragWidget(event, widget)}
  ondragend={onDragEnd}
  role="button"
  aria-label={widget.title}
  tabindex={editMode ? 0 : -1}
>
  {#if editMode}
    <Button
      class="absolute top-1.5 left-1.5 right-1.5 z-3 flex items-center justify-center gap-1.5 h-7 border-0 rounded-t-lg text-xs font-extrabold cursor-grab transition-opacity duration-100 opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
      draggable={widget.type === 'button'}
      ondragstart={(event: DragEvent) => onDragWidget(event, widget)}
      ondragend={onDragEnd}
      onpointerdown={(event: PointerEvent) => onStartMove(event, widget)}
    >
      <GripHorizontal size={16} />
    </Button>
    <Button
      class="absolute top-1.5 right-1.5 z-5 grid size-7 opacity-100"
      aria-label={m.editor_delete_widget()}
      variant="ghost"
      title={m.editor_delete_widget()}
      onclick={(event: MouseEvent) => onDelete(event, widget)}
    >
      <Trash2 size={14} />
    </Button>
  {/if}

  <div
    class={[
      'flex w-full h-full min-w-0 min-h-0 overflow-hidden border border-border rounded-lg backdrop-blur-md',
      editMode
        ? 'bg-popover shadow-[0_0_0_1px_rgb(250_189_47/24%),0_18px_46px_rgb(0_0_0/26%)]'
        : 'bg-card shadow-[0_12px_34px_rgb(0_0_0/16%)]'
    ]}
  >
    {@render children?.()}
  </div>

  {#if editMode}
    <Button
      class="absolute top-10 bottom-2 left-0 z-4 h-auto w-3 min-h-0 cursor-ew-resize rounded-none border-0 bg-transparent p-0 text-transparent hover:bg-accent/16 focus-visible:opacity-100"
      aria-label="Resize widget from left edge"
      title="Resize widget from left edge"
      onpointerdown={(event: PointerEvent) =>
        onStartResize(event, widget, 'left')}
      variant="ghost"
    ></Button>
    <Button
      class="absolute top-10 right-0 bottom-2 z-4 h-auto w-3 min-h-0 cursor-ew-resize rounded-none border-0 bg-transparent p-0 text-transparent hover:bg-accent/16 focus-visible:opacity-100"
      aria-label="Resize widget from right edge"
      title="Resize widget from right edge"
      onpointerdown={(event: PointerEvent) =>
        onStartResize(event, widget, 'right')}
      variant="ghost"
    ></Button>
    <Button
      class="absolute right-2 bottom-0 left-2 z-4 h-3 min-h-0 cursor-ns-resize rounded-none border-0 bg-transparent p-0 text-transparent hover:bg-accent/16 focus-visible:opacity-100"
      aria-label="Resize widget from bottom edge"
      title="Resize widget from bottom edge"
      onpointerdown={(event: PointerEvent) =>
        onStartResize(event, widget, 'bottom')}
      variant="ghost"
    ></Button>
  {/if}
</div>
