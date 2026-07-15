<script lang="ts">
  import type { PageConfig } from '$lib/types/config.js'

  let {
    pages = [],
    activePageId = '',
    onSelect = (id: string) => {}
  }: {
    pages: PageConfig[]
    activePageId: string
    onSelect: (id: string) => void
  } = $props()
</script>

<div
  class="flex items-end gap-0 px-6 pt-2 overflow-x-auto scrollbar-none shrink-0 bg-card/60"
  role="tablist"
  aria-orientation="horizontal"
>
  {#each pages as page (page.id)}
    <button
      role="tab"
      aria-selected={page.id === activePageId}
      onclick={() => onSelect(page.id)}
      class="relative px-4 py-1.5 text-sm font-medium border border-b-0 rounded-t-lg transition-colors duration-150 whitespace-nowrap -mb-[1px] cursor-pointer
        {page.id === activePageId
          ? 'bg-background text-accent border-border z-10'
          : 'bg-card text-muted-foreground border-transparent hover:text-foreground hover:border-border'
        }"
    >
      {page.title}
    </button>
  {/each}
</div>
