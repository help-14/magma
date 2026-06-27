<script>
  import { RefreshCw } from '@lucide/svelte'

  /**
   * WidgetStateWrapper — Unified idle/loading/error/content state rendering.
   * @prop {'idle'|'loading'|'error'|'content'} state - Current widget state.
   * @prop {string} [idleMessage='Configure in properties'] - Message shown in idle state.
   * @prop {string} [errorMsg=''] - Error message shown in error state.
   * @prop {import('svelte').Snippet} [children] - Content rendered when state is 'content'.
   */
  let {
    state,
    idleMessage = 'Configure in properties',
    errorMsg = '',
    children
  } = $props()
</script>

{#if state === 'idle'}
  <div
    class="flex items-center justify-center h-full text-magma-muted text-xs p-4"
  >
    {idleMessage}
  </div>
{:else if state === 'loading'}
  <div class="flex items-center justify-center h-full">
    <RefreshCw class="animate-spin text-magma-muted" size={24} />
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
