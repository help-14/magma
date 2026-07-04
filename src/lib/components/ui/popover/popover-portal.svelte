<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";

	let { ...restProps }: Record<string, any> = $props();
</script>

<PopoverPrimitive.Portal {...restProps} />