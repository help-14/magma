<script>
  import { m } from '$lib/paraglide/messages.js';
  import { useNow } from './clock.svelte.js'
  /** @type {import('$lib/types/widget.js').TimerWidgetProps} */
  let { widget, compact = false } = $props()
  let now = useNow()

  function greeting() {
    const hour = now.getHours()
    if (hour >= 5 && hour < 12) return m.timer_morning()
    if (hour >= 12 && hour < 17) return m.timer_afternoon()
    if (hour >= 17 && hour < 20) return m.timer_evening()
    return m.timer_night()
  }

  function formattedDate() {
    return now.toLocaleTimeString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
</script>

<div class="flex flex-col justify-center p-4 w-full min-w-0 min-h-0">
  <span class="text-magma-muted">{formattedDate()}</span>
  <strong class="mt-2 text-[clamp(1.4rem,3vw,2.65rem)] leading-[1.05]"
    >{greeting()}</strong
  >
</div>
