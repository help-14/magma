<script lang="ts">
  import type { PageConfig } from "$lib/types/config.js";

  let {
    pages = [],
    activePageId = "",
    onSelect = (id: string) => {},
    position = "left",
  }: {
    pages: PageConfig[];
    activePageId: string;
    onSelect: (id: string) => void;
    position?: "left" | "right";
  } = $props();

  let hoveredId = $state<string | null>(null);
</script>

<div
  class="fixed top-0 h-screen z-50 flex flex-col justify-center
    {position === 'left' ? 'left-4' : 'right-4'}"
  role="tablist"
>
  <div class="flex flex-col gap-2 min-w-32">
    {#each pages as page (page.id)}
      <button
        role="tab"
        aria-selected={page.id === activePageId}
        onclick={() => onSelect(page.id)}
        onmouseenter={() => (hoveredId = page.id)}
        onmouseleave={() => (hoveredId = null)}
        class="{position === 'right'
          ? 'text-right'
          : 'text-left'} px-3 py-1 transition-all duration-200 ease-out
          {position === 'right' ? 'border-r-2' : 'border-l-2'}
          {page.id === activePageId ? 'border-white' : 'border-transparent'}"
        style="font-size: {hoveredId === page.id || page.id === activePageId
          ? '1rem'
          : '0.75rem'}; color: {hoveredId === page.id ||
        page.id === activePageId
          ? 'var(--foreground)'
          : 'var(--muted-foreground)'}"
      >
        {page.title}
      </button>
    {/each}
  </div>
</div>
