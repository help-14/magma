<script lang="ts">
  import { ExternalLink } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button/index.js'
  import { getWidgetRefreshContext } from '$lib/components/dashboard/widget-refresh-context.js'

  let { widget, compact = false } = $props()
  const refreshContext = getWidgetRefreshContext()

  let iframeKey = $state(0)
  let url = $derived(widget.config?.url || '')

  let target = $derived(
    url
      ? url.startsWith('http://') || url.startsWith('https://')
        ? url
        : 'https://' + url
      : ''
  )

  function reload() {
    iframeKey++
  }

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, target ? reload : null)
    return () => refreshContext?.registerRefresh(widget.id, null)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full">
  {#if !target}
    <div
      class="flex items-center justify-center h-full text-muted-foreground text-xs p-4"
    >
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
    <div class="absolute top-1 right-8 flex gap-1">
      <a href={target} target="_blank" rel="noreferrer" title="Open in new tab">
        <Button variant="ghost" class="p-1 rounded text-sm aspect-square">
          <ExternalLink class="size-3" />
        </Button>
      </a>
    </div>
  {/if}
</div>
