<script>
  /**
   * WidgetTitleBar — Unified title bar for widgets.
   * @prop {string} title - The widget title to display.
   * @prop {import('svelte').Snippet} [icon] - Optional leading icon snippet.
   * @prop {import('svelte').Snippet} [trailing] - Optional trailing snippet (e.g., status badge).
   */
  let { title, icon, trailing } = $props()
</script>

<div
  class="flex items-center gap-2 text-magma-accent text-sm font-extrabold px-3 pt-2 pb-1 shrink-0"
>
  {#if icon}
    <span class="shrink-0">{@render icon()}</span>
  {/if}
  <span class="truncate">{title}</span>
  {#if trailing}
    <span class="shrink-0">{@render trailing()}</span>
  {/if}
</div>
