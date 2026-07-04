<script lang="ts">
  import { RefreshCw } from '@lucide/svelte'
  import DashboardIcon from '../DashboardIcon.svelte';
  import { resolveUrl } from '$lib/remotes/button.remote.js'
  import type { ButtonWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: ButtonWidgetProps = $props();

  let navigating = $state(false);

  function parseUrls() {
    const raw = widget.config?.urls || '';
    const urls = raw.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const legacyUrl = (widget.config as { url?: string } | undefined)?.url
    if (urls.length === 0 && legacyUrl) {
      return [legacyUrl.trim()];
    }
    return urls;
  }

  async function handleClick() {
    if (navigating) return;
    const urls = parseUrls();
    if (urls.length === 0) return;

    if (urls.length === 1) {
      navigate(urls[0]);
      return;
    }

    navigating = true;
    try {
      const result = await resolveUrl({ urls });
      navigate(result || urls[0]);
    } catch {
      navigate(urls[0]);
    } finally {
      navigating = false;
    }
  }

  function navigate(url: string) {
    const target = widget.config?.openIn || '_self';
    if (target === '_self') {
      window.location.href = url;
    } else {
      window.open(url, target);
    }
  }
</script>

<button
  onclick={handleClick}
  disabled={navigating}
  class="button-widget relative flex items-center justify-center gap-2.5 w-full h-full overflow-hidden p-3 rounded-lg text-magma-text text-center no-underline transition-all duration-150 hover:bg-magma-accent/14 hover:text-[#fff7df] hover:shadow-[0_10px_24px_rgb(0_0_0/20%)] active:bg-magma-accent/24 active:shadow-[0_4px_12px_rgb(0_0_0/20%)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-magma-accent focus-visible:outline-offset-2"
>
  {#if navigating}
    <RefreshCw class="animate-spin text-magma-accent" size={compact ? 20 : 26} />
  {:else}
    <DashboardIcon
      name={widget.config?.icon}
      color={widget.config?.iconColor}
      size={compact ? 20 : 26}
      title={widget.title}
    />
  {/if}
  <span class="overflow-hidden text-ellipsis whitespace-nowrap">{widget.title}</span>
</button>
