<script>
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { Toaster } from "$lib/components/ui/sonner/index.js";

  let { children, data } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="stylesheet" href={`/custom.css?v=${data.customCssVersion}`} />
</svelte:head>
{@render children()}
<Toaster position="top-right" richColors closeButton />
