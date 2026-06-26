<script>
  // @ts-nocheck
  import { RefreshCw } from '@lucide/svelte'
  import { fetchUrl } from '$lib/remotes/fetch.remote.js'

  /** @type {import('$lib/types/widget.js').BaseWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let htmlContent = $state('')
  let iframeKey = $state(0)

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600)
  let url = $derived(widget.config?.url || '')

  async function doFetch() {
    if (!url) return
    state = 'loading'
    errorMsg = ''
    try {
      const result = await fetchUrl({
        url,
        method: widget.config?.method || 'GET',
        headers: widget.config?.headers || '[]',
        body: widget.config?.body || ''
      })
      if (!result.ok) {
        state = 'error'
        errorMsg = `${result.status} ${result.statusText}`
        return
      }
      try {
        const fn = new Function(
          'responseText',
          widget.config?.formatScript || 'return responseText'
        )
        const html = fn(result.responseText)
        htmlContent = html ?? ''
        state = 'content'
        iframeKey++
      } catch (scriptErr) {
        state = 'error'
        errorMsg = 'Script error: ' + (scriptErr.message || String(scriptErr))
      }
    } catch (err) {
      state = 'error'
      errorMsg = 'Request failed: ' + (err.message || String(err))
    }
  }

  $effect(() => {
    if (!url) {
      state = 'idle'
      htmlContent = ''
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full">
  <div class="text-magma-accent text-sm font-extrabold px-3 p-2 pb-1 shrink-0">
    {widget.title}
  </div>
  {#if state === 'idle'}
    <div
      class="flex items-center justify-center h-full text-magma-muted text-xs p-4"
    >
      Configure URL in properties
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
  {:else if state === 'content'}
    <iframe
      key={iframeKey}
      sandbox="allow-scripts"
      srcdoc={htmlContent}
      class="w-full h-full border-0 min-w-0 min-h-0 p-1"
      title={widget.title}
    ></iframe>
  {/if}
  <button
    onclick={doFetch}
    class="absolute top-1 right-1 p-1 rounded hover:bg-white/10 text-magma-muted hover:text-magma-text transition-colors"
    title="Refresh"
  >
    <RefreshCw size={12} />
  </button>
</div>
