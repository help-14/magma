<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="popover-title"
	class={cn("font-medium", className)}
	{...restProps}
>
	{@render children?.()}
</div>