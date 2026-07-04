<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

	let { ...restProps }: Record<string, any> = $props();
</script>

<ContextMenuPrimitive.Portal {...restProps} />