<script lang="ts">
  import { m } from "$lib/paraglide/messages.js";
  import { useNow } from "./clock.svelte.js";
  import type { TimerWidgetProps } from "$lib/types/widget.js";

  let { widget, compact = false }: TimerWidgetProps = $props();

  let now = useNow();
  let size = $derived(
    compact ? "small" : (widget.config?.interface ?? "medium"),
  );

  function greeting() {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return m.timer_morning();
    if (hour >= 12 && hour < 17) return m.timer_afternoon();
    if (hour >= 17 && hour < 20) return m.timer_evening();
    return m.timer_night();
  }

  function formatTime() {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: widget.config?.hour12 ?? false,
    };
    if (widget.config?.timezone) opts.timeZone = widget.config.timezone;
    if (size !== "small" && widget.config?.showSeconds) opts.second = "2-digit";
    return now.toLocaleTimeString("en-US", opts);
  }

  function formatDate() {
    if (!(widget.config?.showDate ?? true) || size === "small") return "";
    const opts: Intl.DateTimeFormatOptions =
      size === "large"
        ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        : { weekday: "short", month: "short", day: "numeric" };
    if (widget.config?.timezone) opts.timeZone = widget.config.timezone;
    return now.toLocaleDateString("en-US", opts);
  }

  function formatTimezone() {
    if (!widget.config?.timezone) return "";
    try {
      const short = now.toLocaleTimeString("en-US", {
        timeZone: widget.config.timezone,
        timeZoneName: "short",
      });
      return short.split(" ").pop() || widget.config.timezone.split("/").pop();
    } catch {
      return widget.config.timezone.split("/").pop() || widget.config.timezone;
    }
  }

  function formatMediumDateTime() {
    const showDate = widget.config?.showDate ?? true;
    const tz = widget.config?.timezone || undefined;
    if (showDate) {
      const datePart = now.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: tz,
      });
      const timePart = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: widget.config?.hour12 ?? false,
        timeZone: tz,
      });
      return `${datePart} · ${timePart}`;
    }
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: widget.config?.hour12 ?? false,
      timeZone: tz,
    });
  }

  let dateStr = $derived(formatDate());
  let timeStr = $derived(formatTime());
  let greetingStr = $derived(greeting());
  let tzStr = $derived(formatTimezone());
  let mediumDateTimeStr = $derived(formatMediumDateTime());
</script>

{#if size === "small"}
  <div
    class="flex items-center justify-center w-full h-full min-w-0 min-h-0 p-2"
  >
    <span
      class="text-white font-bold leading-none text-[clamp(2rem,10vw,5rem)]"
    >
      {timeStr}
    </span>
  </div>
{:else if size === "medium"}
  <div
    class="flex flex-col justify-center w-full min-w-0 min-h-0 h-full p-4 gap-1"
  >
    <span class="text-muted-foreground text-sm leading-snug"
      >{mediumDateTimeStr}</span
    >
    {#if widget.config?.showGreeting ?? true}
      <strong class="text-3xl">
        {greetingStr}
      </strong>
    {/if}
  </div>
{:else}
  <div
    class="flex flex-col justify-center w-full min-w-0 min-h-0 h-full p-4 gap-1"
  >
    <span
      class="text-white font-bold leading-none text-[clamp(1.8rem,5vw,3rem)]"
    >
      {timeStr}
    </span>

    {#if dateStr}
      <span class="text-muted-foreground text-sm leading-snug">
        {dateStr}
      </span>
    {/if}

    {#if widget.config?.showGreeting ?? true}
      <span class="text-accent text-xs leading-snug">
        {greetingStr}
        {#if tzStr}
          <span class="text-muted-foreground"> · {tzStr}</span>
        {/if}
      </span>
    {:else if tzStr}
      <span class="text-muted-foreground text-xs leading-snug">{tzStr}</span>
    {/if}
  </div>
{/if}
