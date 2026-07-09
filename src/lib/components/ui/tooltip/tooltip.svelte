<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui'

  let { open = $bindable(false), ...restProps }: Record<string, any> = $props()
</script>

<TooltipPrimitive.Root bind:open {...restProps} />
