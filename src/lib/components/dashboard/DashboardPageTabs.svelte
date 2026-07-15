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
  class="flex items-end gap-0 px-6 pt-2 overflow-x-auto scrollbar-none shrink-0 bg-[#1d2021]/60"
  role="tablist"
>
  {#each pages as page (page.id)}
    <button
      role="tab"
      aria-selected={page.id === activePageId}
      onclick={() => onSelect(page.id)}
      class="relative px-4 py-1.5 text-sm font-medium border border-b-0 rounded-t-lg transition-all duration-150 whitespace-nowrap -mb-[1px] cursor-pointer
        {page.id === activePageId
          ? 'bg-[#282828] text-[#fabd2f] border-[#3c3836] z-10'
          : 'bg-[#1d2021] text-[#a89984] border-transparent hover:text-[#ebdbb2] hover:border-[#3c3836]'
        }"
    >
      {page.title}
    </button>
  {/each}
</div>
