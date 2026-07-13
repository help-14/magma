<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { FieldLabel } from '$lib/components/ui/field-label/index.js'
  import type { WidgetPaletteProps } from '$lib/types/widget.js'

  let {
    onClose = () => {},
    onDragStart = () => {},
    onDragEnd = () => {}
  }: WidgetPaletteProps = $props()

  const templates = [
    {
      type: 'button',
      title: m.widget_name_button(),
      w: 4,
      h: 2,
      config: { icon: 'server', urls: '', openIn: '_self' }
    },
    {
      type: 'calendar',
      title: m.widget_name_calendar(),
      w: 8,
      h: 8,
      config: {}
    },
    {
      type: 'chatgpt',
      title: m.widget_name_chatgpt(),
      w: 6,
      h: 7,
      config: { refreshInterval: 600 }
    },
    {
      type: 'claude',
      title: m.widget_name_claude(),
      w: 6,
      h: 7,
      config: { provider: 'claude.ai', refreshInterval: 600 }
    },
    {
      type: 'deepseek',
      title: m.widget_name_deepseek(),
      w: 6,
      h: 6,
      config: { refreshInterval: 600 }
    },
    {
      type: 'docker-status',
      title: m.widget_name_docker(),
      w: 8,
      h: 8,
      config: {}
    },
    { type: 'fetch', title: m.widget_name_fetch(), w: 8, h: 8, config: {} },
    {
      type: 'rss',
      title: m.widget_name_rss(),
      w: 6,
      h: 8,
      config: {
        feeds: '[{"url":"https://hnrss.org/frontpage","title":"HN"}]',
        style: 'vertical-list',
        limit: 25,
        collapseAfter: 5
      }
    },
    {
      type: 'stock',
      title: m.widget_name_stock(),
      w: 6,
      h: 6,
      config: {
        stocks: 'SPY: S&P 500\nAAPL: Apple\nNVDA\nBTC-USD: Bitcoin',
        sortBy: 'change',
        refreshInterval: 300
      }
    },
    {
      type: 'search',
      title: m.widget_name_search(),
      w: 6,
      h: 2,
      config: { provider: 'google' }
    },
    {
      type: 'stack',
      title: m.widget_name_stack(),
      w: 6,
      h: 6,
      config: { flow: 'horizontal', cols: 2, rows: 0, gap: 12 },
      children: []
    },
    { type: 'timer', title: m.widget_name_timer(), w: 10, h: 4, config: {} },
    {
      type: 'weather',
      title: m.widget_name_weather(),
      w: 6,
      h: 6,
      config: {
        provider: 'open-meteo',
        cityName: 'London',
        interface: 'small'
      }
    },
    { type: 'website', title: m.widget_name_website(), w: 8, h: 6, config: {} },
    {
      type: 'youtube-live',
      title: m.widget_name_youtube(),
      w: 8,
      h: 6,
      config: { mode: 'uploads', channels: '', limit: 10 }
    },
    {
      type: 'github-repo',
      title: m.widget_name_github_repo(),
      w: 8,
      h: 8,
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
  aria-label={m.palette_aria_label()}
  style="left: {posX}px; top: {posY}px;"
>
  <div
    class="flex items-center justify-between gap-4 cursor-grab select-none active:cursor-grabbing"
    role="toolbar"
    tabindex="-1"
    aria-label={m.palette_drag_to_move()}
    onpointerdown={startDrag}
  >
    <div>
      <FieldLabel accent class="block m-0 mb-1"
        >{m.palette_heading()}</FieldLabel
      >
      <h2 class="m-0 text-xl leading-none">{m.palette_subtitle()}</h2>
    </div>
    <Button
      variant="ghost"
      type="button"
      class="aspect-square"
      aria-label={m.properties_close()}
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
        <!-- <span class="text-muted-foreground text-xs"
          >{template.w} x {template.h}</span
        > -->
      </Button>
    {/each}
  </div>
</aside>
