<script>
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { ...restProps } = $props();
</script>

<PopoverPrimitive.Portal {...restProps} />