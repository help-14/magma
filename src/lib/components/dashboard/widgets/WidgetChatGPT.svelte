<script lang="ts">
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { chatgptUsage } from "$lib/remotes/chatgpt.remote.js";
  import { getWidgetRefreshContext } from "$lib/components/dashboard/widget-refresh-context.js";
  import WidgetStateWrapper from "./WidgetStateWrapper.svelte";
  import type { ChatGptWidgetProps } from "$lib/types/widget.js";

  let { widget }: ChatGptWidgetProps = $props();
  const refreshContext = getWidgetRefreshContext();

  let widgetState: "idle" | "loading" | "error" | "content" = $state("idle");
  let errorMsg = $state("");
  let data: any = $state(null);

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600);
  let authToken = $derived(widget.config?.authToken || "");

  let planType = $derived(
    data?.plan_type
      ? data.plan_type.charAt(0).toUpperCase() + data.plan_type.slice(1)
      : "",
  );

  let primaryPct = $derived(
    data?.rate_limit?.primary_window?.used_percent ?? 0,
  );
  let secondaryPct = $derived(
    data?.rate_limit?.secondary_window?.used_percent ?? 0,
  );

  let primaryReset = $derived(
    data?.rate_limit?.primary_window?.reset_after_seconds
      ? formatResetTime(data.rate_limit.primary_window.reset_after_seconds)
      : "",
  );

  let secondaryReset = $derived(
    data?.rate_limit?.secondary_window?.reset_after_seconds
      ? formatResetTime(data.rate_limit.secondary_window.reset_after_seconds)
      : "",
  );

  let creditsBalance = $derived(
    data?.credits?.balance != null
      ? `$${parseFloat(data.credits.balance).toFixed(0)}`
      : "",
  );

  let resetCreditsCount = $derived(
    data?.rate_limit_reset_credits?.available_count ?? 0,
  );

  let size = $derived(
    widget.config?.interface ??
      ((widget.w ?? 0) <= 2 && (widget.h ?? 0) <= 2 ? "small" : "medium"),
  );

  function formatResetTime(seconds: number): string {
    const resetDate = new Date(Date.now() + seconds * 1000);
    const hours = resetDate.getHours();
    const minutes = resetDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const m = minutes.toString().padStart(2, "0");
    const time = `${h12}:${m} ${ampm}`;
    if (seconds > 86400) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[resetDate.getDay()];
      return `${dayName} ${time}`;
    }
    return time;
  }

  async function doFetch() {
    if (!authToken) return;
    widgetState = "loading";
    errorMsg = "";
    try {
      const result = await chatgptUsage({ authToken });
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
      <div
        class="grid grid-cols-[max-content_1fr_max-content] gap-x-2 items-center justify-center h-full p-3"
      >
        <span class="text-xs">5-hour</span>
        <Progress value={primaryPct} class="h-2 grow" />
        <span class="text-xs text-right">{primaryPct}%</span>
        {#if size !== "small"}
          <span class="text-xs text-muted-foreground/60 italic col-span-3"
            >Resets {primaryReset}</span
          >
        {/if}
        <span class="text-xs mt-3">7-day</span>
        <Progress value={secondaryPct} class="h-2 mt-1" />
        <span class="text-xs text-right mt-1">{secondaryPct}%</span>
        {#if size !== "small"}
          <span class="text-xs text-muted-foreground/60 italic col-span-3"
            >Resets {secondaryReset}</span
          >
          <div
            class="flex items-center gap-1 text-xs text-muted-foreground mt-3 col-span-3"
          >
            {planType}
            {#if creditsBalance}
              <span>|</span>
              <span>Credits: {creditsBalance}</span>
            {/if}
            {#if resetCreditsCount > 0}
              <span>|</span>
              <span>Resets: {resetCreditsCount}</span>
            {/if}
          </div>
        {/if}
      </div>
    {/snippet}
  </WidgetStateWrapper>
</div>
