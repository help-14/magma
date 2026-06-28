<script>
  // @ts-nocheck
  import { Search } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { tick } from 'svelte'

  /** @type {import('$lib/types/widget.js').SearchWidgetProps} */
  let { widget, compact = false } = $props()
  let searchInput = $state()

  const searchProviders = {
    google: 'https://google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    youtube: 'https://www.youtube.com/results?search_query=',
    wikipedia: 'https://en.wikipedia.org/w/index.php?search='
  }

  let provider = $derived(widget.config?.provider || 'google')
  let providerUrl = $derived(
    searchProviders[provider] || searchProviders.google
  )

  $effect(() => {
    if (!compact) {
      tick().then(() => searchInput?.focus())
    }
  })

  function search(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('query') || '').trim()
    if (query) {
      window.location.href = `${providerUrl}${encodeURIComponent(query)}`
    }
  }
</script>

<form
  class="flex items-center gap-3 py-3 px-4 w-full min-w-0 min-h-0"
  onsubmit={search}
>
  <Search size={18} class="text-magma-accent shrink-0" />
  <input
    bind:this={searchInput}
    name="query"
    placeholder={widget.config?.placeholder || m.search_placeholder()}
    autocomplete="off"
    class="w-full min-w-0 border-0 outline-0 bg-transparent text-magma-text"
  />
</form>
