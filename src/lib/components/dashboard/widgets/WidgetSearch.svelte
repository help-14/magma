<script>
  // @ts-nocheck
  import { Search } from '@lucide/svelte'
  import { onMount } from 'svelte'
  let { widget, compact = false } = $props()
  let searchInput = $state()

  onMount(() => {
    if (!compact) {
      setTimeout(() => searchInput?.focus(), 0)
    }
  })

  function search(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('query') || '').trim()
    if (query) {
      window.location.href = `https://google.com/search?q=${encodeURIComponent(query)}`
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
    placeholder={widget.config?.placeholder || 'Search...'}
    autocomplete="off"
    class="w-full min-w-0 border-0 outline-0 bg-transparent text-magma-text"
  />
</form>
