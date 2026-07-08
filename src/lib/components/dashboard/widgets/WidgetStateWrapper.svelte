<script lang="ts">
  import { RefreshCw } from '@lucide/svelte'
  import type { Snippet } from 'svelte'

  let {
    state,
    idleMessage = 'Configure in properties',
    errorMsg = '',
    children
  }: {
    state: 'idle' | 'loading' | 'error' | 'content'
    idleMessage?: string
    errorMsg?: string
    children?: Snippet
  } = $props()
</script>

{#if state === 'idle'}
  <div
    class="flex items-center justify-center h-full text-muted-foreground text-xs p-4"
  >
    {idleMessage}
  </div>
{:else if state === 'loading'}
  <div class="flex items-center justify-center h-full">
    <RefreshCw class="animate-spin text-muted-foreground" size={24} />
  </div>
{:else if state === 'error'}
  <div
    class="flex items-center justify-center h-full text-red-400 text-xs p-4 text-center"
  >
    {errorMsg}
  </div>
{:else if state === 'content'}
  {@render children?.()}
{/if}
