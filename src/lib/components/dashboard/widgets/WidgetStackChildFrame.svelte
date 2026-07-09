<script lang="ts">
  import { Trash2 } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'

  let {
    child,
    editMode = false,
    selected = false,
    onSelect = () => {},
    onDelete = () => {},
    onPointerDown = () => {},
    children
  }: {
    child: any
    editMode?: boolean
    selected?: boolean
    onSelect?: (event: Event, child: any) => void
    onDelete?: (event: MouseEvent, child: any) => void
    onPointerDown?: (event: PointerEvent, child: any) => void
    children?: Snippet
  } = $props()
</script>

<div
  class:selected
  class={[
    'relative min-w-0 min-h-0 overflow-hidden rounded-lg bg-white/6',
    selected && 'shadow-[0_0_0_2px_var(--accent),0_18px_46px_rgb(0_0_0/26%)]'
  ]}
  role="listitem"
  onpointerdown={(event: PointerEvent) => {
    if (editMode) onPointerDown(event, child)
  }}
  onclickcapture={(event: MouseEvent) => {
    if (editMode && event.button === 0) onSelect(event, child)
  }}
>
  {#if editMode}
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-1.5 right-1.5 z-5 size-7 border border-white/18 rounded-lg bg-red-950/90 text-red-100 cursor-pointer transition-all duration-100 hover:bg-red-800/95 active:scale-96 focus-visible:opacity-100 opacity-100"
      aria-label={m.widget_delete()}
      title={m.widget_delete()}
      onclick={(event: MouseEvent) => {
        event.stopPropagation()
        onDelete(event, child)
      }}
    >
      <Trash2 size={13} />
    </Button>
  {/if}
  {@render children?.()}
</div>