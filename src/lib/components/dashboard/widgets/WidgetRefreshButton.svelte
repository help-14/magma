<script>
  import { RefreshCw } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button/index.js'

  /**
   * WidgetRefreshButton — Standard top-right refresh button.
   * @prop {() => void} onclick - Called when button is clicked.
   */
  let { onclick } = $props()
</script>

<Button
  {onclick}
  variant="ghost"
  disabled={false}
  class="absolute top-1 right-1 p-1 rounded text-sm aspect-square"
  title="Refresh"
>
  <RefreshCw class="size-3" />
</Button>
