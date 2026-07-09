<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui'

  let { delayDuration = 0, ...restProps }: Record<string, any> = $props()
</script>

<TooltipPrimitive.Provider {delayDuration} {...restProps} />
