<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { CalendarWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: CalendarWidgetProps = $props()
  let viewDate = $state(new Date())
  let today = $state(new Date())

  let currYear = $derived(viewDate.getFullYear())
  let currMonth = $derived(viewDate.getMonth())

  let months = $derived([
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ])

  function computeDays() {
    const firstDay = (new Date(currYear, currMonth, 1).getDay() + 6) % 7
    const lastDate = new Date(currYear, currMonth + 1, 0).getDate()
    const lastDay = new Date(currYear, currMonth, lastDate).getDay()
    const lastDateLastMonth = new Date(currYear, currMonth, 0).getDate()

    const result = []

    for (let i = firstDay; i > 0; i--) {
      result.push({
        day: lastDateLastMonth - i + 1,
        active: false,
        today: false
      })
    }
    for (let i = 1; i <= lastDate; i++) {
      const isToday =
        i === today.getDate() &&
        currMonth === today.getMonth() &&
        currYear === today.getFullYear()
      result.push({ day: i, active: true, today: isToday })
    }
    for (let i = lastDay; i < 6; i++) {
      result.push({ day: i - lastDay + 1, active: false, today: false })
    }

    return result
  }

  let days = $derived(computeDays())

  function prevMonth() {
    let d = new Date(currYear, currMonth - 1, 1)
    viewDate = d
  }

  function nextMonth() {
    let d = new Date(currYear, currMonth + 1, 1)
    viewDate = d
  }
</script>

<div class="flex flex-col p-3 w-full min-w-0 min-h-0 items-stretch">
  <header class="flex items-center justify-between">
    <strong class="text-sm">{months[currMonth]} {currYear}</strong>
    <div class="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        disabled={false}
        class="size-7"
        onclick={prevMonth}
        aria-label={m.calendar_prev_month()}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={false}
        class="size-7"
        onclick={nextMonth}
        aria-label={m.calendar_next_month()}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  </header>
  <ul
    class="grid grid-cols-7 gap-0 grow list-none p-0 m-0 text-center text-sm items-center"
  >
    {#each days as day}
      <li
        class={[
          'py-1 rounded-lg',
          !day.active && 'opacity-30',
          day.today && 'bg-magma-accent/20 text-magma-accent font-bold'
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {day.day}
      </li>
    {/each}
  </ul>
</div>
