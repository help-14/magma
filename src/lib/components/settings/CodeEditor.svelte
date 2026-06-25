<script>
	// @ts-nocheck
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	let {
		value = $bindable(''),
		highlighted = '',
		label = 'Code editor',
		placeholder = ''
	} = $props();

	let highlightLayer = $state();

	function syncScroll(event) {
		if (!highlightLayer) return;
		highlightLayer.scrollTop = event.currentTarget.scrollTop;
		highlightLayer.scrollLeft = event.currentTarget.scrollLeft;
	}
</script>

<div class="settings-editor" aria-label={label}>
	<pre bind:this={highlightLayer} aria-hidden="true">{@html highlighted}</pre>
	<Textarea
		bind:value
		spellcheck="false"
		aria-label={label}
		{placeholder}
		onscroll={syncScroll}
	/>
</div>
