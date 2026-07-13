<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { toErrorMessage } from "$lib/errors.js";
  import { Radio } from "@lucide/svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import {
    getYoutubeUploads,
    getYoutubeLivestreams,
  } from "$lib/remotes/youtube.remote.js";
  import { getWidgetRefreshContext } from "$lib/components/dashboard/widget-refresh-context.js";
  import WidgetStateWrapper from "./WidgetStateWrapper.svelte";
  import type { YoutubeWidgetProps } from "$lib/types/widget.js";

  let { widget, compact = false }: YoutubeWidgetProps = $props();
  const refreshContext = getWidgetRefreshContext();

  let widgetState: "idle" | "loading" | "error" | "content" = $state("idle");
  let errorMsg = $state("");
  let data: any = $state(null);

  let mode = $derived(widget.config?.mode || "uploads");
  let channels = $derived(widget.config?.channels || "");
  let flow = $derived(widget.config?.flow || "vertical");
  let cols = $derived(widget.config?.cols ?? 2);
  let rows = $derived(widget.config?.rows ?? 0);
  let limit = $derived(widget.config?.limit ?? 10);
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 60);

  let channelList = $derived(
    channels
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  let gridStyle = $derived.by(() => {
    if (flow === "horizontal" && rows > 0) {
      return `grid-template-rows: repeat(${rows}, auto); grid-auto-flow: column;`;
    }
    return `grid-template-columns: repeat(${cols}, auto);`;
  });

  let scrollOrientation = $derived<"vertical" | "horizontal">(
    flow === "horizontal" ? "horizontal" : "vertical",
  );

  async function doFetch() {
    if (channelList.length === 0) {
      widgetState = "idle";
      return;
    }
    widgetState = "loading";
    errorMsg = "";
    try {
      let result;
      if (mode === "livestream") {
        result = await getYoutubeLivestreams({ channels: channelList });
      } else {
        result = await getYoutubeUploads({ channels: channelList, limit });
      }
      if (!result.ok) {
        widgetState = "error";
        errorMsg = toErrorMessage(result.error || "");
        return;
      }
      data = result.data;
      widgetState = "content";
    } catch (err) {
      widgetState = "error";
      errorMsg = err instanceof Error ? toErrorMessage(err.message) : String(err);
    }
  }

  $effect(() => {
    void channelList;
    doFetch();
    const id = setInterval(doFetch, refreshInterval * 1000);
    return () => clearInterval(id);
  });

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, doFetch);
    return () => refreshContext?.registerRefresh(widget.id, null);
  });
</script>

{#snippet thumbnailCard(item: any)}
  <a
    href={item.videoUrl}
    target="_blank"
    rel="noreferrer"
    class="group relative rounded-lg overflow-hidden border border-border/30 no-underline w-48"
  >
    <div class="aspect-video bg-muted/20">
      <img
        src={item.thumbnail}
        alt={item.title}
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </div>
    <div
      class="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <div class="absolute inset-0 bg-black/70"></div>
      <span
        class="relative text-xs font-semibold text-white line-clamp-2 leading-tight"
      >
        {item.title}
      </span>
      <span class="relative text-[11px] text-white/70 truncate">
        {item.channelName}
      </span>
    </div>
  </a>
{/snippet}

{#snippet channelNameLabel(name: string)}
  <div
    class="flex items-center justify-center rounded-lg border border-border/20 bg-popover/30 p-3 w-48"
  >
    <span class="text-xs text-muted-foreground text-center leading-tight">
      {name}
    </span>
  </div>
{/snippet}

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full p-3 content-center"
>
  {#if mode === "livestream"}
    <div
      class="flex items-center gap-1.5 px-3 pt-2 pb-1 text-accent text-xs font-extrabold shrink-0"
    >
      <Radio size={12} class="text-accent" />
      <span>{m.youtube_live()}</span>
    </div>
  {/if}

  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage={m.widget_state_configure()}
  >
    {#snippet children()}
      <ScrollArea class="flex-1 min-h-0 w-full" orientation={scrollOrientation}>
        <div class="grid gap-2 pt-2 justify-center" style={gridStyle}>
          {#if mode === "uploads"}
            {#each data.videos as video (video.videoId)}
              {@render thumbnailCard(video)}
            {/each}
          {:else}
            {#each data.channels as ch (ch.channelId)}
              {#if ch.isLive}
                {@render thumbnailCard(ch)}
              {:else}
                {@render channelNameLabel(ch.channelName)}
              {/if}
            {/each}
          {/if}
        </div>
      </ScrollArea>
    {/snippet}
  </WidgetStateWrapper>

</div>
