<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		value,
		...restProps
	}: { ref?: HTMLElement | null; class?: string; value: string; [key: string]: any } = $props();
</script>

<TabsPrimitive.Content
	bind:ref
	{value}
	data-slot="tabs-content"
	class={cn("text-sm flex-1 outline-none", className)}
	{...restProps}
/>
