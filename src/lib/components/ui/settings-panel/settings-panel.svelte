<script lang="ts">
  import { cn } from '$lib/utils.js'

  let {
    title = '',
    description = '',
    class: className,
    children
  }: {
    title?: string
    description?: string
    class?: string
    children?: import('svelte').Snippet
  } = $props()
</script>

<aside
  class={cn(
    'border border-border rounded-lg bg-card shadow-[0_18px_60px_rgb(0_0_0/24%)] backdrop-blur-xl p-4 text-muted-foreground',
    className
  )}
>
  {#if title}
    <h2 class="text-foreground text-base m-0 mb-2.5">{title}</h2>
  {/if}
  {#if description}
    <p>{@html description}</p>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</aside>
