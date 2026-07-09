<script lang="ts">
  import { Popover as PopoverPrimitive } from 'bits-ui'

  let { open = $bindable(false), ...restProps }: Record<string, any> = $props()
</script>

<PopoverPrimitive.Root bind:open {...restProps} />
