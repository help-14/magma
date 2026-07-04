<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { ref = $bindable(null), ...restProps }: Record<string, any> = $props();
</script>

<PopoverPrimitive.Close bind:ref data-slot="popover-close" {...restProps} />