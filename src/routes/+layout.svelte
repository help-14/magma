<script lang="ts">
  import "./layout.css";
  import { Toaster } from "$lib/components/ui/sonner/index.js";

  let { children, data } = $props();

  let bgImage = $derived(data.theme?.backgroundImage ?? "");
</script>

<svelte:head>
  <title>{data.siteTitle}</title>
  <link rel="stylesheet" href={`/custom.css?v=${data.customCssVersion}`} />
</svelte:head>

<div class="relative min-h-screen text-foreground">
  {#if bgImage}
    <div class="background" style="--magma-bg:url('{bgImage}');"></div>
  {:else}
    <div class="background"></div>
  {/if}
  {@render children()}
</div>
<Toaster position="top-right" richColors closeButton />
