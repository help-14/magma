<script>
  // @ts-nocheck
  import { fetchUrl } from '$lib/remotes/fetch.remote.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'

  /** @type {import('$lib/types/widget.js').BaseWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let htmlContent = $state('')
  let contentKey = $state(0)

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
        const html = fn(result.responseText) ?? ''
        htmlContent = html
        contentKey++
        state = 'content'
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

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full p-1">
  <WidgetTitleBar title={widget.title} />
  <WidgetStateWrapper
    {state}
    {errorMsg}
    idleMessage="Configure URL in properties"
  >
    {#snippet children()}
      {#key contentKey}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="w-full h-full min-w-0 min-h-0 overflow-y-auto p-2 [&_img]:max-w-full [&_table]:w-full"
          onclickcapture={(e) => e.stopPropagation()}
        >
          {@html htmlContent}
        </div>
      {/key}
    {/snippet}
  </WidgetStateWrapper>
  <WidgetRefreshButton onclick={doFetch} />
</div>
