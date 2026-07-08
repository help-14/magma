<script lang="ts">
  import type { Snippet } from 'svelte'

  let { title, icon, trailing }: { title: string; icon?: Snippet; trailing?: Snippet } = $props()
</script>

<div
  class="flex items-center gap-2 text-accent text-sm font-extrabold px-3 pt-2 pb-1 shrink-0"
>
  {#if icon}
    <span class="shrink-0">{@render icon()}</span>
  {/if}
  <span class="truncate">{title}</span>
  {#if trailing}
    <span class="shrink-0">{@render trailing()}</span>
  {/if}
</div>
