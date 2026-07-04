<script lang="ts">
  import { Settings } from '@lucide/svelte';
  import type { FallbackWidgetProps } from '$lib/types/widget.js';

  let { widget, compact = false }: FallbackWidgetProps = $props();
</script>

<div class="flex flex-col justify-center gap-2 p-4 w-full min-w-0 min-h-0">
  <Settings size={28} class="text-magma-accent shrink-0" />
  <strong>{widget.title}</strong>
  <span class="text-magma-muted">{widget.type}</span>
</div>
