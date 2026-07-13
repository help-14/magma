<script lang="ts">
  import { cn } from '$lib/utils.js'

  let {
    accent = false,
    class: className,
    children
  }: {
    accent?: boolean
    class?: string
    children?: import('svelte').Snippet
  } = $props()
</script>

<span
  class={cn(
    'text-xs font-bold uppercase',
    accent ? 'text-accent' : 'text-muted-foreground',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
</span>
