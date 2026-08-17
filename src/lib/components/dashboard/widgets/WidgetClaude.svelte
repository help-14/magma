<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { toErrorMessage } from "$lib/errors.js";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import { claudeAiUsage } from "$lib/remotes/claude.remote.js";
  import { getWidgetRefreshContext } from "$lib/components/dashboard/widget-refresh-context.js";
  import WidgetStateWrapper from "./WidgetStateWrapper.svelte";
  import type { ClaudeWidgetProps } from "$lib/types/widget.js";

  let { widget }: ClaudeWidgetProps = $props();
  const refreshContext = getWidgetRefreshContext();

  let widgetState: "idle" | "loading" | "error" | "content" = $state("idle");
  let errorMsg = $state("");
  let data: any = $state(null);

  let cookie = $derived(widget.config?.cookie || "");
  let organizationId = $derived(widget.config?.organizationId || "");
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
    data?.fiveHour?.reset_at || data?.fiveHour?.resets_at
      ? formatTime(data.fiveHour?.reset_at || data.fiveHour?.resets_at)
      : "",
  );
  let sevenDayReset = $derived(
    data?.sevenDay?.reset_at || data?.sevenDay?.resets_at
      ? formatTime(data.sevenDay?.reset_at || data.sevenDay?.resets_at)
      : "",
  );

  let size = $derived(
    widget.config?.interface ??
      ((widget.w ?? 0) <= 2 && (widget.h ?? 0) <= 2 ? "small" : "medium"),
  );

  function formatTime(iso: string): string {
    const resetDate = new Date(iso);
    const timeStr = resetDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    if (resetDate.getTime() - new Date().getTime() > 86400) {
      const dayStr = resetDate.toLocaleDateString([], { weekday: "short" });
      return `${dayStr} ${timeStr}`;
    }
    return timeStr;
  }

  async function doFetch() {
    if (!cookie) return;
    widgetState = "loading";
    errorMsg = "";
    try {
      const result = await claudeAiUsage({ cookie, organizationId });
      if (!result.ok) {
        widgetState = "error";
        errorMsg = toErrorMessage(result.error || "");
        return;
      }
      data = result.data;
      widgetState = "content";
    } catch (err) {
      widgetState = "error";
      errorMsg =
        err instanceof Error ? toErrorMessage(err.message) : String(err);
    }
  }

  $effect(() => {
    if (!cookie) {
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

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full justify-center"
>
  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage={m.widget_state_configure()}
  >
    {#snippet children()}
      <div
        class="grid grid-cols-[max-content_1fr_max-content] items-center w-full gap-x-2 gap-y-1 p-3"
      >
        <span class="text-xs">{m.claude_five_hour()}</span>
        <Progress value={fiveHourPct} class="h-2 grow" />
        <span class="text-xs text-right">{fiveHourPct.toFixed(0)}%</span>
        <span class="text-xs text-muted-foreground/60 italic col-span-3 mb-2">
          {fiveHourReset
            ? m.claude_resets({ time: fiveHourReset })
            : "No active sesion"}
        </span>
        {#if size !== "small"}
          <span class="text-xs">{m.claude_seven_day()}</span>
          <Progress value={sevenDayPct} class="h-2 grow" />
          <span class="text-xs text-right">{sevenDayPct.toFixed(0)}%</span>
          <span class="text-xs text-muted-foreground/60 italic col-span-3">
            {m.claude_resets({ time: sevenDayReset })}
          </span>
        {/if}
      </div>
    {/snippet}
  </WidgetStateWrapper>
</div>
