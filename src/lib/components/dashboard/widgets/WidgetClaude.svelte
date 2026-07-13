<script lang="ts">
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { claudeAiUsage, claudeApiUsage } from "$lib/remotes/claude.remote.js";
  import { getWidgetRefreshContext } from "$lib/components/dashboard/widget-refresh-context.js";
  import WidgetStateWrapper from "./WidgetStateWrapper.svelte";
  import type { ClaudeWidgetProps } from "$lib/types/widget.js";

  let { widget }: ClaudeWidgetProps = $props();
  const refreshContext = getWidgetRefreshContext();

  let widgetState: "idle" | "loading" | "error" | "content" = $state("idle");
  let errorMsg = $state("");
  let data: any = $state(null);

  let provider = $derived(widget.config?.provider ?? "claude.ai");
  let authToken = $derived(widget.config?.authToken || "");
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600);

  let fiveHourPct = $derived(
    data?.fiveHour?.utilization != null
      ? Math.min(
          data.fiveHour.utilization <= 1
            ? data.fiveHour.utilization * 100
            : data.fiveHour.utilization,
          100,
        )
      : 0,
  );
  let sevenDayPct = $derived(
    data?.sevenDay?.utilization != null
      ? Math.min(
          data.sevenDay.utilization <= 1
            ? data.sevenDay.utilization * 100
            : data.sevenDay.utilization,
          100,
        )
      : 0,
  );
  let fiveHourReset = $derived(
    data?.fiveHour?.resets_at ? formatTime(data.fiveHour.resets_at) : "",
  );
  let sevenDayReset = $derived(
    data?.sevenDay?.resets_at ? formatTime(data.sevenDay.resets_at) : "",
  );

  let requestsPct = $derived(
    data?.requestsLimit
      ? ((data.requestsLimit - data.requestsRemaining) / data.requestsLimit) *
          100
      : 0,
  );
  let tokensPct = $derived(
    data?.tokensLimit
      ? ((data.tokensLimit - data.tokensRemaining) / data.tokensLimit) * 100
      : 0,
  );
  let requestsUsed = $derived(
    data?.requestsLimit != null
      ? data.requestsLimit - data.requestsRemaining
      : 0,
  );
  let tokensUsed = $derived(
    data?.tokensLimit != null ? data.tokensLimit - data.tokensRemaining : 0,
  );

  let size = $derived(
    (widget.w ?? 0) <= 2 && (widget.h ?? 0) <= 2 ? "small" : "medium",
  );

  function formatTime(iso: string): string {
    const d = new Date(iso);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const m = minutes.toString().padStart(2, "0");
    return `${h12}:${m} ${ampm}`;
  }

  function formatTokenCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  async function doFetch() {
    if (!authToken) return;
    widgetState = "loading";
    errorMsg = "";
    try {
      const fn = provider === "claude.ai" ? claudeAiUsage : claudeApiUsage;
      const result = await fn({ authToken });
      if (!result.ok) {
        widgetState = "error";
        errorMsg = result.error || "";
        return;
      }
      data = result.data;
      widgetState = "content";
    } catch (err) {
      widgetState = "error";
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  $effect(() => {
    if (!authToken) {
      widgetState = "idle";
      data = null;
      return;
    }
    doFetch();
    const id = setInterval(doFetch, refreshInterval * 1000);
    return () => clearInterval(id);
  });

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, doFetch);
    return () => refreshContext?.registerRefresh(widget.id, null);
  });
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full">
  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage="Configure Auth Token in properties"
  >
    {#snippet children()}
      {#if provider === "claude.ai"}
        <div
          class="grid grid-cols-[max-content_1fr_max-content] gap-x-2 gap-y-3 items-center justify-center h-full p-3"
        >
          <span class="text-xs">5-hour</span>
          <Progress value={fiveHourPct} class="h-2 grow" />
          <span class="text-xs text-right">{fiveHourPct.toFixed(0)}%</span>
          {#if size !== "small"}
            <span
              class="text-xs text-muted-foreground/60 italic col-span-3 -mt-2"
              >Resets {fiveHourReset}</span
            >
          {/if}
          <span class="text-xs mt-3">7-day</span>
          <Progress value={sevenDayPct} class="h-2 mt-1" />
          <span class="text-xs text-right mt-1">{sevenDayPct.toFixed(0)}%</span>
          {#if size !== "small"}
            <span
              class="text-xs text-muted-foreground/60 italic col-span-3 -mt-2"
              >Resets {sevenDayReset}</span
            >
            {#if data?.email}
              <div
                class="flex items-center gap-1 text-xs text-muted-foreground mt-3 col-span-3"
              >
                <span>{data.email}</span>
              </div>
            {/if}
          {/if}
        </div>
      {:else}
        <div
          class="grid grid-cols-[max-content_1fr_max-content] gap-x-2 items-center justify-center h-full p-3"
        >
          <span class="text-xs">Requests</span>
          <Progress value={requestsPct} class="h-2 grow" />
          <span class="text-xs text-right"
            >{requestsUsed}/{data?.requestsLimit ?? 0}</span
          >
          <span class="text-xs mt-3">Tokens</span>
          <Progress value={tokensPct} class="h-2 mt-1" />
          <span class="text-xs text-right mt-1"
            >{formatTokenCount(tokensUsed)}/{formatTokenCount(
              data?.tokensLimit ?? 0,
            )}</span
          >
        </div>
      {/if}
    {/snippet}
  </WidgetStateWrapper>
</div>
