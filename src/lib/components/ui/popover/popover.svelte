<script>
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { open = $bindable(false), ...restProps } = $props();
</script>

<PopoverPrimitive.Root bind:open {...restProps} />