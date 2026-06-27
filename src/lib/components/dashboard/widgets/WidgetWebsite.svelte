<script>
  // @ts-nocheck
  import { ExternalLink, RefreshCw } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button/index.js'

  let { widget, compact = false } = $props()

  let iframeKey = $state(0)
  let url = $derived(widget.config?.url || '')

  let target = $derived(url ? (url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url) : '')

  function reload() {
    iframeKey++
  }
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full">
  {#if !compact}
    <div class="flex items-center justify-between text-magma-accent text-sm font-extrabold px-3 p-2 pb-1 shrink-0">
      <span class="truncate">{widget.title}</span>
    </div>
  {/if}
  {#if !target}
    <div class="flex items-center justify-center h-full text-magma-muted text-xs p-4">
      Configure URL in properties
    </div>
  {:else}
    {#key iframeKey}
      <iframe
        src={target}
        sandbox="allow-scripts allow-same-origin allow-forms"
        class="w-full h-full border-0 min-w-0 min-h-0"
        title={widget.title}
      ></iframe>
    {/key}
  {/if}
  {#if target}
    <div class="absolute top-1 right-1 flex gap-1">
      <a href={target} target="_blank" rel="noreferrer" title="Open in new tab">
        <Button variant="ghost" class="p-1 rounded text-sm aspect-square cursor-pointer">
          <ExternalLink class="size-3" />
        </Button>
      </a>
      <Button onclick={reload} variant="ghost" class="p-1 rounded text-sm aspect-square" title="Reload">
        <RefreshCw class="size-3" />
      </Button>
    </div>
  {/if}
</div>
