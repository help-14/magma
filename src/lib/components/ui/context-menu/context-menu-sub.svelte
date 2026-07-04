<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	let { open = $bindable(false), ...restProps }: Record<string, any> = $props();
</script>

<ContextMenuPrimitive.Sub bind:open {...restProps} />