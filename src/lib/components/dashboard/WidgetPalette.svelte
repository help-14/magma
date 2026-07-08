<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { WidgetPaletteProps } from '$lib/types/widget.js'

  let {
    onClose = () => {},
    onDragStart = () => {},
    onDragEnd = () => {}
  }: WidgetPaletteProps = $props()

  const templates = [
    {
      type: 'button',
      title: 'Button',
      w: 4,
      h: 2,
      config: { icon: 'server', urls: '', openIn: '_self' }
    },
    { type: 'calendar', title: 'Calendar', w: 4, h: 4, config: {} },
    {
      type: 'deepseek',
      title: 'DeepSeek',
      w: 3,
      h: 2,
      config: { refreshInterval: 600 }
    },
    { type: 'docker-status', title: 'Docker', w: 6, h: 4, config: {} },
    { type: 'fetch', title: 'Fetch', w: 8, h: 8, config: {} },
    {
      type: 'rss',
      title: 'RSS',
      w: 4,
      h: 4,
      config: {
        feeds: '[{"url":"https://hnrss.org/frontpage","title":"HN"}]',
        style: 'vertical-list',
        limit: 25,
        collapseAfter: 5
      }
    },
    {
      type: 'stock',
      title: 'Stock',
      w: 4,
      h: 4,
      config: {
        stocks: 'SPY: S&P 500\nAAPL: Apple\nNVDA\nBTC-USD: Bitcoin',
        sortBy: 'change',
        refreshInterval: 300
      }
    },
    {
      type: 'search',
      title: 'Search',
      w: 4,
      h: 2,
      config: { provider: 'google' }
    },
    {
      type: 'stack',
      title: 'Stack',
      w: 3,
      h: 4,
      config: { flow: 'horizontal', cols: 2, rows: 0, gap: 12 },
      children: []
    },
    { type: 'timer', title: 'Timer', w: 10, h: 4, config: {} },
    {
      type: 'weather',
      title: 'Weather',
      w: 4,
      h: 4,
      config: { provider: 'open-meteo', cityName: 'London' }
    },
    { type: 'website', title: 'Website', w: 8, h: 6, config: {} },
    {
      type: 'youtube-live',
      title: 'YouTube',
      w: 4,
      h: 4,
      config: { mode: 'uploads', channels: '', limit: 10 }
    },
    {
      type: 'github-repo',
      title: 'GitHub Repo',
      w: 4,
      h: 4,
      config: {
        repo: '',
        showStars: true,
        showForks: true,
        showPrs: true,
        showIssues: true,
        refreshInterval: 3600
      }
    }
  ]

  let el = $state<HTMLElement | null>(null)
  let posX = $state<number | null>(null)
  let posY = $state<number | null>(null)
  let dragOffset = $state({ x: 0, y: 0 })
  let dragging = $state(false)

  $effect(() => {
    if (!el || posX !== null) return
    const rect = el.getBoundingClientRect()
    posX = (window.innerWidth - rect.width) / 2
    posY = window.innerHeight - rect.height - 84
  })

  function startDrag(event: PointerEvent) {
    if ((event.target as Element | null)?.closest('button')) return
    if (!el) return
    event.preventDefault()
    const rect = el.getBoundingClientRect()
    if (posX === null) posX = rect.left
    if (posY === null) posY = rect.top
    dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    dragging = true

    const dragH = rect.height

    function move(moveEvent: PointerEvent) {
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
  class={`fixed z-21 w-[min(760px,calc(100vw-48px))] max-h-[min(520px,calc(100vh-120px))] p-4.5 border border-border rounded-lg bg-[rgb(26_22_18/92%)] text-foreground shadow-[0_30px_90px_rgb(0_0_0/45%)] backdrop-blur-xl overflow-auto max-sm:w-[calc(100vw-24px)] ${dragging ? 'shadow-[0_30px_90px_rgb(0_0_0/60%)] transition-none' : ''}`}
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
      <p class="text-accent text-xs font-bold uppercase m-0 mb-1">
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
    {#each templates as template (template.type)}
      <Button
        variant="magma"
        type="button"
        draggable="true"
        ondragstart={(event: DragEvent) => onDragStart(event, template)}
        ondragend={onDragEnd}
      >
        <strong>{template.title}</strong>
        <span class="text-muted-foreground text-xs"
          >{template.w} x {template.h}</span
        >
      </Button>
    {/each}
  </div>
</aside>
