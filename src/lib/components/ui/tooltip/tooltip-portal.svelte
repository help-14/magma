<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";

	let { ...restProps }: Record<string, any> = $props();
</script>

<TooltipPrimitive.Portal {...restProps} />