<script lang="ts">
  import { Settings } from '@lucide/svelte'
  import type { FallbackWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: FallbackWidgetProps = $props()
</script>

<div class="flex flex-col justify-center gap-2 p-4 w-full min-w-0 min-h-0">
  <Settings size={28} class="text-accent shrink-0" />
  <span class="text-muted-foreground">{widget.type}</span>
</div>
