<script>
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { setLocale } from "$lib/paraglide/runtime.js";

  let { children, data } = $props();

  $effect(() => {
    if (data.locale) {
      setLocale(data.locale, { reload: false });
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="stylesheet" href={`/custom.css?v=${data.customCssVersion}`} />
</svelte:head>
{@render children()}
<Toaster position="top-right" richColors closeButton />
