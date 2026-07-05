<script lang="ts">
  import './layout.css'
  import { Toaster } from '$lib/components/ui/sonner/index.js'
  import { setLocale } from '$lib/paraglide/runtime.js'

  let { children, data } = $props()

  $effect(() => {
    if (data.locale) {
      setLocale(data.locale, { reload: false })
    }
  })
</script>

<svelte:head>
  <title>{data.siteTitle}</title>
  <link rel="stylesheet" href={`/custom.css?v=${data.customCssVersion}`} />
</svelte:head>
{@render children()}
<Toaster position="top-right" richColors closeButton />
