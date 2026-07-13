<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { toErrorMessage } from "$lib/errors.js";
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

  let primaryLabel = $derived(
    formatWindowLabel(
      data?.rate_limit?.primary_window?.limit_window_seconds ?? 0,
    ),
  );

  let primaryPct = $derived(
    data?.rate_limit?.primary_window?.used_percent ?? 0,
  );
  let hasSecondary = $derived(data?.rate_limit?.secondary_window != null);

  let secondaryPct = $derived(
    data?.rate_limit?.secondary_window?.used_percent ?? 0,
  );

  let primaryReset = $derived(
    data?.rate_limit?.primary_window?.reset_after_seconds
      ? formatResetTime(data.rate_limit.primary_window.reset_after_seconds)
      : "",
  );

  let secondaryReset = $derived(
    hasSecondary && data?.rate_limit?.secondary_window?.reset_after_seconds
      ? formatResetTime(data.rate_limit.secondary_window.reset_after_seconds)
      : "",
  );

  function formatWindowLabel(seconds: number): string {
    if (seconds <= 0) return "";
    if (seconds === 604800) return m.chatgpt_weekly_usage();
    const hours = seconds / 3600;
    if (hours < 24) {
      const h = Math.round(hours);
      return h === 1 ? m.chatgpt_hour_usage({ hours: h }) : m.chatgpt_hours_usage({ hours: h });
    }
    const days = Math.round(hours / 24);
    return m.chatgpt_days_usage({ days });
  }

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
    const timeStr = resetDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (seconds > 86400) {
      const dayStr = resetDate.toLocaleDateString([], { weekday: "short" });
      return `${dayStr} ${timeStr}`;
    }
    return timeStr;
  }

  async function doFetch() {
    if (!authToken) return;
    widgetState = "loading";
    errorMsg = "";
    try {
      const result = await chatgptUsage({ authToken });
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
        class="grid grid-cols-[max-content_1fr_max-content] gap-x-2 gap-y-3 items-center justify-center p-3"
      >
          <span class="text-xs">{primaryLabel}</span>
          <Progress value={primaryPct} class="h-2 grow" />
          <span class="text-xs text-right">{primaryPct}%</span>
          <span class="text-xs text-muted-foreground/60 italic col-span-3 -mt-2"
            >{m.chatgpt_resets({ time: primaryReset })}</span
          >
          {#if hasSecondary}
            <span class="text-xs">{m.chatgpt_days_usage({ days: 7 })}</span>
            <Progress value={secondaryPct} class="h-2" />
            <span class="text-xs text-right">{secondaryPct}%</span>
            {#if size !== "small"}
              <span
                class="text-xs text-muted-foreground/60 italic col-span-3 -mt-2"
                >{m.chatgpt_resets({ time: secondaryReset })}</span
              >
            {/if}
          {/if}
          {#if size !== "small"}
            <div
              class="flex items-center gap-1 text-xs text-muted-foreground col-span-3"
            >
              {planType}
              {#if creditsBalance}
                <span>|</span>
                <span>{m.chatgpt_credits({ balance: creditsBalance })}</span>
              {/if}
              {#if resetCreditsCount > 0}
                <span>|</span>
                <span>{m.chatgpt_resets_count({ count: resetCreditsCount })}</span>
              {/if}
            </div>
          {/if}
      </div>
    {/snippet}
  </WidgetStateWrapper>
</div>
