<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { Popover as PopoverPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: Record<string, any> = $props()
</script>

<PopoverPrimitive.Trigger
  bind:ref
  data-slot="popover-trigger"
  class={cn('', className)}
  {...restProps}
/>
