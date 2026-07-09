<script lang="ts">
  import { fetchUrl } from '$lib/remotes/fetch.remote.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'
  import type { BaseWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: BaseWidgetProps = $props()

  let widgetState: 'idle' | 'loading' | 'error' | 'content' = $state('idle')
  let errorMsg = $state('')
  let htmlContent = $state('')
  let contentKey = $state(0)

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600)
  let url = $derived(widget.config?.url || '')

  async function doFetch() {
    if (!url) return
    widgetState = 'loading'
    errorMsg = ''
    try {
      const result = await fetchUrl({
        url,
        method: widget.config?.method || 'GET',
        headers: widget.config?.headers || '[]',
        body: widget.config?.body || ''
      })
      if (!result.ok) {
        widgetState = 'error'
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
        widgetState = 'content'
      } catch (scriptErr) {
        widgetState = 'error'
        errorMsg =
          'Script error: ' +
          (scriptErr instanceof Error ? scriptErr.message : String(scriptErr))
      }
    } catch (err) {
      widgetState = 'error'
      errorMsg =
        'Request failed: ' + (err instanceof Error ? err.message : String(err))
    }
  }

  $effect(() => {
    if (!url) {
      widgetState = 'idle'
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
    state={widgetState}
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
