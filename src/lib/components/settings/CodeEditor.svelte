<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	let {
		value = $bindable(''),
		highlighted = '',
		label = 'Code editor',
		placeholder = ''
	}: { value?: string; highlighted?: string; label?: string; placeholder?: string } = $props();

	let highlightLayer = $state<HTMLPreElement>();

	function syncScroll(event: Event) {
		if (!highlightLayer) return;
		const textarea = event.currentTarget as HTMLTextAreaElement;
		highlightLayer.scrollTop = textarea.scrollTop;
		highlightLayer.scrollLeft = textarea.scrollLeft;
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
