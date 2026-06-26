<script>
  // @ts-nocheck
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'

  /** @type {import('$lib/types/widget.js').WidgetPaletteProps} */
  let {
    templates = [],
    onClose = () => {},
    onDragStart = () => {},
    onDragEnd = () => {}
  } = $props()

  let el = $state(null)
  let posX = $state(null)
  let posY = $state(null)
  let dragOffset = $state({ x: 0, y: 0 })
  let dragging = $state(false)

  $effect(() => {
    if (!el || posX !== null) return
    const rect = el.getBoundingClientRect()
    posX = (window.innerWidth - rect.width) / 2
    posY = window.innerHeight - rect.height - 84
  })

  function startDrag(event) {
    if (event.target.closest('button')) return
    event.preventDefault()
    const rect = el.getBoundingClientRect()
    if (posX === null) posX = rect.left
    if (posY === null) posY = rect.top
    dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    dragging = true

    const dragH = rect.height

    function move(moveEvent) {
      let x = moveEvent.clientX - dragOffset.x
      let y = moveEvent.clientY - dragOffset.y
      const w = Math.min(760, window.innerWidth - 48)
      x = Math.max(0, Math.min(window.innerWidth - w, x))
      y = Math.max(0, Math.min(window.innerHeight - dragH, y))
      posX = x
      posY = y
    }

    function stop() {
      dragging = false
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }
</script>

<aside
  bind:this={el}
  class={`fixed z-21 w-[min(760px,calc(100vw-48px))] max-h-[min(520px,calc(100vh-120px))] p-4.5 border border-magma-line rounded-lg bg-[rgb(26_22_18/92%)] text-magma-text shadow-[0_30px_90px_rgb(0_0_0/45%)] backdrop-blur-xl overflow-auto max-sm:w-[calc(100vw-24px)] ${dragging ? 'shadow-[0_30px_90px_rgb(0_0_0/60%)] transition-none' : ''}`}
  aria-label="Widget palette"
  style="left: {posX}px; top: {posY}px;"
>
  <div
    class="flex items-center justify-between gap-4 cursor-grab select-none active:cursor-grabbing"
    role="toolbar"
    tabindex="-1"
    aria-label="Drag to move"
    onpointerdown={startDrag}
  >
    <div>
      <p class="text-magma-accent text-xs font-bold uppercase m-0 mb-1">
        {m.palette_heading()}
      </p>
      <h2 class="m-0 text-xl leading-none">{m.palette_subtitle()}</h2>
    </div>
    <Button
      variant="ghost"
      type="button"
      class="aspect-square"
      onclick={onClose}>x</Button
    >
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
    {#each templates as template}
      <Button
        variant="magma"
        type="button"
        draggable="true"
        ondragstart={(event) => onDragStart(event, template)}
        ondragend={onDragEnd}
      >
        <strong>{template.title}</strong>
        <span class="text-magma-muted text-xs">{template.w} x {template.h}</span
        >
      </Button>
    {/each}
  </div>
</aside>
