<script>
  // @ts-nocheck
  import { RefreshCw, Radio } from '@lucide/svelte'
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import {
    getYoutubeUploads,
    getYoutubeLivestreams
  } from '$lib/remotes/youtube.remote.js'

  /** @type {import('$lib/types/widget.js').YoutubeWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('configuring')
  let errorMsg = $state('')
  let data = $state(null)

  let mode = $derived(widget.config?.mode || 'uploads')
  let channels = $derived(widget.config?.channels || '')
  let flow = $derived(widget.config?.flow || 'vertical')
  let cols = $derived(widget.config?.cols ?? 2)
  let rows = $derived(widget.config?.rows ?? 0)
  let limit = $derived(widget.config?.limit ?? 10)

  let channelList = $derived(
    channels
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  )

  let gridStyle = $derived.by(() => {
    if (flow === 'horizontal' && rows > 0) {
      return `grid-template-rows: repeat(${rows}, auto); grid-auto-flow: column;`
    }
    return `grid-template-columns: repeat(${cols}, auto);`
  })

  let scrollOrientation = $derived(
    flow === 'horizontal' ? 'horizontal' : 'vertical'
  )

  async function doFetch() {
    if (channelList.length === 0) {
      state = 'configuring'
      return
    }
    state = 'loading'
    errorMsg = ''
    try {
      let result
      if (mode === 'livestream') {
        result = await getYoutubeLivestreams({ channels: channelList })
      } else {
        result = await getYoutubeUploads({ channels: channelList, limit })
      }
      if (!result.ok) {
        state = 'error'
        errorMsg = result.error
        return
      }
      data = result.data
      state = 'content'
    } catch (err) {
      state = 'error'
      errorMsg = err.message || String(err)
    }
  }

  $effect(() => {
    doFetch()
    const id = setInterval(doFetch, 60000)
    return () => clearInterval(id)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full p-3">
  <div class="flex items-center justify-between shrink-0 mb-2">
    <span class="text-magma-accent text-sm font-extrabold">{widget.title}</span>
    {#if mode === 'livestream'}
      <Radio size={12} class="text-magma-accent" />
    {/if}
  </div>

  {#if state === 'configuring'}
    <div
      class="flex items-center justify-center h-full text-magma-muted text-xs p-4 text-center"
    >
      Add channel IDs in properties
    </div>
  {:else if state === 'loading'}
    <div class="flex items-center justify-center h-full">
      <RefreshCw class="animate-spin text-magma-muted" size={24} />
    </div>
  {:else if state === 'error'}
    <div
      class="flex items-center justify-center h-full text-red-400 text-xs p-4 text-center"
    >
      {errorMsg}
    </div>
  {:else if state === 'content' && mode === 'uploads'}
    <ScrollArea class="flex-1 min-h-0 w-full" orientation={scrollOrientation}>
      <div class="grid gap-2 justify-center" style={gridStyle}>
        {#each data.videos as video (video.videoId)}
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noreferrer"
            class="group relative rounded-lg overflow-hidden border border-magma-line/30 no-underline w-48"
          >
            <div class="aspect-video bg-magma-muted/20">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              class="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <div class="absolute inset-0 bg-black/70"></div>
              <span
                class="relative text-xs font-semibold text-white line-clamp-2 leading-tight"
              >
                {video.title}
              </span>
              <span class="relative text-[11px] text-white/70 truncate">
                {video.channelName}
              </span>
            </div>
          </a>
        {/each}
      </div>
    </ScrollArea>
  {:else if state === 'content' && mode === 'livestream'}
    <ScrollArea class="flex-1 min-h-0 w-full" orientation="both">
      <div class="flex flex-col gap-1.5 min-w-max justify-center">
        {#each data.channels as ch (ch.channelId)}
          {#if ch.isLive}
            <a
              href={ch.videoUrl}
              target="_blank"
              rel="noreferrer"
              class="group flex items-start gap-2 rounded-lg overflow-hidden bg-magma-panel-strong/60 hover:bg-magma-panel-strong transition-colors border border-magma-accent/30 no-underline p-1.5 w-80"
            >
              <div
                class="aspect-video shrink-0 bg-magma-muted/20 rounded overflow-hidden"
              >
                <img
                  src={ch.thumbnail}
                  alt={ch.title}
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                <span class="flex items-center gap-1">
                  <span
                    class="size-1.5 rounded-full bg-red-500 animate-pulse shrink-0"
                  ></span>
                  <span class="text-[11px] font-bold text-red-400 uppercase"
                    >LIVE</span
                  >
                </span>
                <span
                  class="text-xs font-semibold text-magma-text line-clamp-2 leading-tight"
                >
                  {ch.title}
                </span>
                <span class="text-[11px] text-magma-muted truncate"
                  >{ch.channelName}</span
                >
              </div>
            </a>
          {:else}
            <div
              class="flex items-center gap-2 rounded-lg p-2 border border-magma-line/20 bg-magma-panel-strong/30 w-80"
            >
              <span class="text-xs text-magma-muted/50">Not streaming</span>
            </div>
          {/if}
        {/each}
      </div>
    </ScrollArea>
  {/if}

  <Button
    onclick={doFetch}
    variant="ghost"
    class="absolute top-1 right-1 p-1 rounded text-sm aspect-square"
    title="Refresh"
  >
    <RefreshCw class="size-3" />
  </Button>
</div>
