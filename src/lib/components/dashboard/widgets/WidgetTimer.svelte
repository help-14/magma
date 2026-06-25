<script>
  import { useNow } from './clock.svelte.js'
  let { widget, compact = false } = $props()
  let now = useNow()

  function greeting() {
    const hour = now.getHours()
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng!'
    if (hour >= 12 && hour < 17) return 'Chiều làm việc hiệu quả!'
    if (hour >= 17 && hour < 20) return 'Chiều tối vui vẻ!'
    return 'Chúc ngủ ngon!'
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
